import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  NotFoundException,
  ForbiddenException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import * as request from 'supertest';
import { StudentsController } from '../students.controller';
import { StudentsService } from '../students.service';

const SCHOOL_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const STUDENT_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';

const mockUser = {
  sub: 'user-1',
  schoolId: SCHOOL_ID,
  roles: ['SCHOOL_ADMIN'],
  jti: 'jti-1',
  email: 'admin@school.com',
};

class MockJwtGuard implements CanActivate {
  static shouldAllow = true;
  canActivate(ctx: ExecutionContext): boolean {
    if (!MockJwtGuard.shouldAllow) throw new ForbiddenException();
    ctx.switchToHttp().getRequest().user = mockUser;
    return true;
  }
}

class MockRolesGuard implements CanActivate {
  static shouldAllow = true;
  canActivate(): boolean {
    if (!MockRolesGuard.shouldAllow) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}

const mockStudent = {
  id: STUDENT_ID,
  schoolId: SCHOOL_ID,
  studentNumber: 'STU-001',
  isActive: true,
  user: { firstName: 'John', lastName: 'Doe', email: 'john@school.com' },
};

const mockStudentsService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deactivate: jest.fn(),
  getDashboard: jest.fn(),
};

describe('StudentsController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: APP_GUARD, useClass: MockJwtGuard },
        { provide: APP_GUARD, useClass: MockRolesGuard },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => {
    jest.clearAllMocks();
    MockJwtGuard.shouldAllow = true;
    MockRolesGuard.shouldAllow = true;
  });

  // ── GET /students ──────────────────────────────────────────────────────────

  describe('GET /students', () => {
    it('200 — returns paginated list', async () => {
      mockStudentsService.findAll.mockResolvedValue({ data: [mockStudent], total: 1, page: 1, limit: 25 });

      const res = await request(app.getHttpServer()).get('/students').set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(mockStudentsService.findAll).toHaveBeenCalledWith(SCHOOL_ID, expect.any(Object));
    });

    it('403 — guard blocks unauthenticated request', async () => {
      MockJwtGuard.shouldAllow = false;
      const res = await request(app.getHttpServer()).get('/students');
      expect(res.status).toBe(403);
    });
  });

  // ── POST /students ─────────────────────────────────────────────────────────

  describe('POST /students', () => {
    const validDto = { email: 'new@school.com', firstName: 'Jane', lastName: 'Doe', studentNumber: 'STU-002' };

    it('201 — creates student successfully', async () => {
      mockStudentsService.create.mockResolvedValue(mockStudent);

      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', 'Bearer token')
        .send(validDto);

      expect(res.status).toBe(201);
      expect(mockStudentsService.create).toHaveBeenCalledWith(SCHOOL_ID, expect.objectContaining({ email: 'new@school.com' }));
    });

    it('400 — rejects missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', 'Bearer token')
        .send({ email: 'bad@school.com' });

      expect(res.status).toBe(400);
    });

    it('400 — rejects invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', 'Bearer token')
        .send({ ...validDto, email: 'not-an-email' });

      expect(res.status).toBe(400);
    });

    it('403 — rejects wrong role', async () => {
      MockRolesGuard.shouldAllow = false;

      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', 'Bearer token')
        .send(validDto);

      expect(res.status).toBe(403);
    });
  });

  // ── GET /students/:id ──────────────────────────────────────────────────────

  describe('GET /students/:id', () => {
    it('200 — returns student profile', async () => {
      mockStudentsService.findById.mockResolvedValue(mockStudent);

      const res = await request(app.getHttpServer())
        .get(`/students/${STUDENT_ID}`)
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(STUDENT_ID);
    });

    it('404 — returns 404 for wrong school or missing student', async () => {
      mockStudentsService.findById.mockRejectedValue(new NotFoundException('Student not found'));

      const res = await request(app.getHttpServer())
        .get(`/students/${STUDENT_ID}`)
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(404);
    });

    it('400 — rejects non-UUID id', async () => {
      const res = await request(app.getHttpServer())
        .get('/students/not-a-uuid')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(400);
    });
  });

  // ── PATCH /students/:id ────────────────────────────────────────────────────

  describe('PATCH /students/:id', () => {
    it('200 — updates student successfully', async () => {
      mockStudentsService.update.mockResolvedValue({ ...mockStudent, gender: 'MALE' });

      const res = await request(app.getHttpServer())
        .patch(`/students/${STUDENT_ID}`)
        .set('Authorization', 'Bearer token')
        .send({ gender: 'MALE' });

      expect(res.status).toBe(200);
    });

    it('404 — returns 404 when student not found', async () => {
      mockStudentsService.update.mockRejectedValue(new NotFoundException('Student not found'));

      const res = await request(app.getHttpServer())
        .patch(`/students/${STUDENT_ID}`)
        .set('Authorization', 'Bearer token')
        .send({ gender: 'MALE' });

      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /students/:id ───────────────────────────────────────────────────

  describe('DELETE /students/:id', () => {
    it('204 — deactivates student', async () => {
      mockStudentsService.deactivate.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete(`/students/${STUDENT_ID}`)
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(204);
    });

    it('404 — returns 404 when student not found', async () => {
      mockStudentsService.deactivate.mockRejectedValue(new NotFoundException('Student not found'));

      const res = await request(app.getHttpServer())
        .delete(`/students/${STUDENT_ID}`)
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(404);
    });
  });
});
