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
import { TeachersController } from '../teachers.controller';
import { TeachersService } from '../teachers.service';

const SCHOOL_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const TEACHER_ID = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';

const mockUser = { sub: 'user-1', schoolId: SCHOOL_ID, roles: ['SCHOOL_ADMIN'], jti: 'jti-1', email: 'admin@school.com' };

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

const mockTeacher = {
  id: TEACHER_ID,
  schoolId: SCHOOL_ID,
  employeeNum: 'EMP-001',
  isActive: true,
  user: { firstName: 'Alice', lastName: 'Smith', email: 'alice@school.com' },
};

const mockTeachersService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deactivate: jest.fn(),
  assignSubject: jest.fn(),
  removeSubject: jest.fn(),
};

describe('TeachersController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [
        { provide: TeachersService, useValue: mockTeachersService },
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

  describe('GET /teachers', () => {
    it('200 — returns teacher list', async () => {
      mockTeachersService.findAll.mockResolvedValue([mockTeacher]);
      const res = await request(app.getHttpServer()).get('/teachers').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('403 — guard blocks unauthenticated', async () => {
      MockJwtGuard.shouldAllow = false;
      const res = await request(app.getHttpServer()).get('/teachers');
      expect(res.status).toBe(403);
    });
  });

  describe('POST /teachers', () => {
    const validDto = { email: 'teacher@school.com', firstName: 'Bob', lastName: 'Jones', employeeNum: 'EMP-002' };

    it('201 — creates teacher successfully', async () => {
      mockTeachersService.create.mockResolvedValue(mockTeacher);
      const res = await request(app.getHttpServer()).post('/teachers').set('Authorization', 'Bearer token').send(validDto);
      expect(res.status).toBe(201);
      expect(mockTeachersService.create).toHaveBeenCalledWith(SCHOOL_ID, expect.objectContaining({ email: 'teacher@school.com' }));
    });

    it('400 — rejects missing employeeNum', async () => {
      const res = await request(app.getHttpServer()).post('/teachers').set('Authorization', 'Bearer token')
        .send({ email: 'teacher@school.com', firstName: 'Bob', lastName: 'Jones' });
      expect(res.status).toBe(400);
    });

    it('400 — rejects invalid email', async () => {
      const res = await request(app.getHttpServer()).post('/teachers').set('Authorization', 'Bearer token')
        .send({ ...validDto, email: 'bad-email' });
      expect(res.status).toBe(400);
    });

    it('403 — rejects wrong role', async () => {
      MockRolesGuard.shouldAllow = false;
      const res = await request(app.getHttpServer()).post('/teachers').set('Authorization', 'Bearer token').send(validDto);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /teachers/:id', () => {
    it('200 — returns teacher profile', async () => {
      mockTeachersService.findById.mockResolvedValue(mockTeacher);
      const res = await request(app.getHttpServer()).get(`/teachers/${TEACHER_ID}`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(TEACHER_ID);
    });

    it('404 — returns 404 for wrong school or missing teacher', async () => {
      mockTeachersService.findById.mockRejectedValue(new NotFoundException('Teacher not found'));
      const res = await request(app.getHttpServer()).get(`/teachers/${TEACHER_ID}`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });

    it('400 — rejects non-UUID id', async () => {
      const res = await request(app.getHttpServer()).get('/teachers/not-a-uuid').set('Authorization', 'Bearer token');
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /teachers/:id', () => {
    it('200 — updates teacher successfully', async () => {
      mockTeachersService.update.mockResolvedValue({ ...mockTeacher, department: 'Science' });
      const res = await request(app.getHttpServer()).patch(`/teachers/${TEACHER_ID}`).set('Authorization', 'Bearer token').send({ department: 'Science' });
      expect(res.status).toBe(200);
    });

    it('404 — returns 404 when teacher not found', async () => {
      mockTeachersService.update.mockRejectedValue(new NotFoundException('Teacher not found'));
      const res = await request(app.getHttpServer()).patch(`/teachers/${TEACHER_ID}`).set('Authorization', 'Bearer token').send({ department: 'Science' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /teachers/:id', () => {
    it('204 — deactivates teacher', async () => {
      mockTeachersService.deactivate.mockResolvedValue(undefined);
      const res = await request(app.getHttpServer()).delete(`/teachers/${TEACHER_ID}`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });

    it('404 — returns 404 when teacher not found', async () => {
      mockTeachersService.deactivate.mockRejectedValue(new NotFoundException('Teacher not found'));
      const res = await request(app.getHttpServer()).delete(`/teachers/${TEACHER_ID}`).set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
    });
  });
});
