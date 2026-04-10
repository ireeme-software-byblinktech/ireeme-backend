import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../database/prisma.service';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testSchoolId: string;
  let testUserId: string;
  let testEmail: string;
  let testPassword: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Seed test data
    testEmail = `admin-${Date.now()}@test.com`;
    testPassword = 'password123';

    const school = await prisma.school.create({
      data: {
        name: 'Test School',
        code: `TEST-${Date.now()}`,
      },
    });
    testSchoolId = school.id;

    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(testPassword, 10);

    const user = await prisma.user.create({
      data: {
        schoolId: testSchoolId,
        email: testEmail,
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
      },
    });
    testUserId = user.id;

    await prisma.userRole.create({
      data: {
        userId: testUserId,
        schoolId: testSchoolId,
        role: 'SCHOOL_ADMIN',
      },
    });
  });

  afterAll(async () => {
    await prisma.userRole.deleteMany({ where: { userId: testUserId } });
    await prisma.refreshToken.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.school.delete({ where: { id: testSchoolId } });
    await app.close();
  });

  it('POST /auth/login with valid credentials → 200, body has accessToken', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(typeof response.body.accessToken).toBe('string');
    accessToken = response.body.accessToken;

    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    if (Array.isArray(cookies)) {
      refreshToken = cookies.find((c: string) => c.startsWith('refreshToken=')) || '';
    }
  });

  it('POST /auth/login with wrong password → 401, body has requestId', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' })
      .expect(401);

    expect(response.body).toHaveProperty('requestId');
  });

  it('POST /auth/login with missing fields → 400', async () => {
    await request(app.getHttpServer()).post('/auth/login').send({ email: testEmail }).expect(400);
  });

  it('POST /auth/refresh with valid refresh cookie → 200, body has new accessToken', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshToken)
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(typeof response.body.accessToken).toBe('string');
  });

  it('GET /auth/me with valid Bearer token → 200, body has id and email', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', testUserId);
    expect(response.body).toHaveProperty('email', testEmail);
  });

  it('GET /auth/me without token → 401', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('POST /auth/logout with valid token → 200', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('GET /auth/me with token after logout → 401 (JTI blacklisted in Redis)', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
