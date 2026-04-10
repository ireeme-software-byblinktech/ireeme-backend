import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Module, Global } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { MessagesModule } from './messages.module';
import { PrismaService } from '../../database/prisma.service';
import { MessageType } from '@prisma/client';
import { UploadsService } from '../uploads/uploads.service';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

/**
 * Mock User data
 */
const mockUser = {
  sub: 'user-777',
  schoolId: 'school-999',
  role: 'STAFF',
};

const testConversationId = '123e4567-e89b-12d3-a456-426614174000';

/**
 * Global TestAuthModule to satisfy REDIS_CLIENT, AuthService and JwtService DI.
 */
@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        on: jest.fn(),
      },
    },
    {
      provide: 'AuthService',
      useValue: {
        validateUser: jest.fn().mockResolvedValue(mockUser),
      },
    },
    {
      provide: JwtService,
      useValue: {
        verify: jest.fn().mockReturnValue(mockUser),
        sign: jest.fn().mockReturnValue('mock-token'),
        verifyAsync: jest.fn().mockResolvedValue(mockUser),
        signAsync: jest.fn().mockResolvedValue('mock-token'),
      },
    },
  ],
  exports: ['REDIS_CLIENT', 'AuthService', JwtService],
})
export class TestAuthModule {}

describe('Messaging Module (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    // Generate real JWT token
    const secret = process.env.JWT_ACCESS_SECRET || 'test-secret';
    authToken = jwt.sign(mockUser, secret);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        EventEmitterModule.forRoot(),
        MessagesModule,
        TestAuthModule,
      ],
    })
      .overrideProvider(UploadsService)
      .useValue({
        upload: jest.fn().mockResolvedValue({ key: 'messages/test-file.png' }),
        getSignedUrl: jest.fn().mockResolvedValue('https://s3.amazonaws.com/test-signed-url'),
      })
      .overrideProvider(EventEmitter2)
      .useValue({
        emit: jest.fn(),
        on: jest.fn(),
        removeAllListeners: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // --- SEEDING (FK ORDER) ---
    
    // 1. School
    await prisma.school.upsert({
      where: { id: mockUser.schoolId },
      update: {},
      create: {
        id: mockUser.schoolId,
        name: 'Test School',
        code: 'TS-999',
      },
    });

    // 2. User
    await prisma.user.upsert({
      where: { id: mockUser.sub },
      update: {},
      create: {
        id: mockUser.sub,
        schoolId: mockUser.schoolId,
        email: `test-${Date.now()}@ireeme.com`,
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'fake-hash',
      },
    });

    // 3. Conversation
    await prisma.conversation.upsert({
      where: { id: testConversationId },
      update: {},
      create: {
        id: testConversationId,
        schoolId: mockUser.schoolId,
      },
    });

    // 4. ConversationMember
    await prisma.conversationMember.upsert({
      where: {
        convId_userId: {
          convId: testConversationId,
          userId: mockUser.sub,
        },
      },
      update: {},
      create: {
        convId: testConversationId,
        userId: mockUser.sub,
        schoolId: mockUser.schoolId,
      },
    });
  });

  afterAll(async () => {
    // --- CLEANUP (REVERSE FK ORDER) ---
    if (prisma) {
      await prisma.message.deleteMany({ where: { convId: testConversationId } }).catch(() => {});
      await prisma.conversationMember.deleteMany({ where: { convId: testConversationId } }).catch(() => {});
      await prisma.conversation.deleteMany({ where: { id: testConversationId } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: mockUser.sub } }).catch(() => {});
      await prisma.school.deleteMany({ where: { id: mockUser.schoolId } }).catch(() => {});
    }
    if (app) {
      await app.close();
    }
  });

  describe('POST /messages', () => {
    it('should send a message with an image and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('attachments', Buffer.from('fake-image-content'), 'test.png')
        .field('convId', testConversationId)
        .field('content', 'Hello with image');

      expect(response.status).toBe(201);
      expect(response.body.content).toBe('Hello with image');
      expect(response.body.fileUrls).toContain('https://s3.amazonaws.com/test-signed-url');
      expect(response.body.type).toBe(MessageType.FILE);

      const inDb = await prisma.message.findFirst({ where: { content: 'Hello with image' } });
      expect(inDb).toBeDefined();
    });

    it('should set type to VOICE for audio files', async () => {
      const response = await request(app.getHttpServer())
        .post('/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('attachments', Buffer.from('fake-audio'), { filename: 'voice.mp3', contentType: 'audio/mpeg' })
        .field('convId', testConversationId)
        .field('content', 'Voice note');

      expect(response.status).toBe(201);
      expect(response.body.type).toBe(MessageType.VOICE);
    });

    it('should return 403 if user is not a member', async () => {
      const foreignId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .post('/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .field('convId', foreignId)
        .field('content', 'Forbidden');

      expect(response.status).toBe(403);
    });
  });

  describe('GET /messages/conversations', () => {
    it('should return all conversations for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBe(testConversationId);
    });
  });

  describe('GET /messages/messages/:convId', () => {
    it('should return 25 messages and hasNextPage true', async () => {
      // Seed 30 messages
      const data = Array.from({ length: 30 }).map((_, i) => ({
        schoolId: mockUser.schoolId,
        convId: testConversationId,
        senderId: mockUser.sub,
        content: `Msg ${i}`,
        type: MessageType.TEXT,
        fileUrls: [],
      }));
      await prisma.message.createMany({ data });

      const response = await request(app.getHttpServer())
        .get(`/messages/messages/${testConversationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 25 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(25);
      expect(response.body.meta.hasNextPage).toBe(true);
    });

    it('should return 403 for non-members', async () => {
      const foreignId = '11111111-1111-1111-1111-111111111111';
      const response = await request(app.getHttpServer())
        .get(`/messages/messages/${foreignId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});
