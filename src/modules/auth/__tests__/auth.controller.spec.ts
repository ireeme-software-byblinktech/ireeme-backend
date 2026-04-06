import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
  ForbiddenException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import * as request from 'supertest';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

const mockAuthUser = {
  sub: 'user-1',
  email: 'admin@school.com',
  schoolId: 'school-1',
  roles: ['SCHOOL_ADMIN'],
  jti: 'jti-abc',
  exp: Math.floor(Date.now() / 1000) + 900,
};

class MockJwtGuard implements CanActivate {
  static shouldAllow = true;
  canActivate(ctx: ExecutionContext): boolean {
    if (!MockJwtGuard.shouldAllow) throw new ForbiddenException();
    ctx.switchToHttp().getRequest().user = mockAuthUser;
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

const mockAuthService = {
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  unlockAccount: jest.fn(),
};

describe('AuthController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
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

  describe('POST /auth/login', () => {
    it('200 — returns accessToken on valid credentials', async () => {
      mockAuthService.login.mockResolvedValue({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      const res = await request(app.getHttpServer()).post('/auth/login').send({ email: 'admin@school.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe('access-token');
    });

    it('400 — rejects missing email', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({ password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('400 — rejects invalid email format', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({ email: 'not-an-email', password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('400 — rejects missing password', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({ email: 'admin@school.com' });
      expect(res.status).toBe(400);
    });

    it('401 — propagates UnauthorizedException from service', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));
      const res = await request(app.getHttpServer()).post('/auth/login').send({ email: 'admin@school.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('204 — logs out successfully', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);
      const res = await request(app.getHttpServer()).post('/auth/logout').set('Authorization', 'Bearer mock-token');
      expect(res.status).toBe(204);
      expect(mockAuthService.logout).toHaveBeenCalledWith('user-1', 'jti-abc', mockAuthUser.exp);
    });
  });

  describe('GET /auth/me', () => {
    it('200 — returns current user from JWT payload', async () => {
      const res = await request(app.getHttpServer()).get('/auth/me').set('Authorization', 'Bearer mock-token');
      expect(res.status).toBe(200);
      expect(res.body.sub).toBe('user-1');
    });

    it('403 — guard blocks unauthenticated request', async () => {
      MockJwtGuard.shouldAllow = false;
      const res = await request(app.getHttpServer()).get('/auth/me');
      expect(res.status).toBe(403);
    });
  });
});
