import { Injectable, UnauthorizedException, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { AuthRepository } from './auth.repository';
import { REDIS_CLIENT } from '../../config/redis.module';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) { }

  async register(dto: RegisterDto) {
    const existingUser = await this.authRepo.findUserByEmail(dto.email);
    if (existingUser) throw new ConflictException('Email already in use');

    // Generate unique school code (e.g., BIS for Blink International School + random 4 digits)
    const baseCode = dto.institutionName
      .split(' ')
      .filter((w) => w.length > 0)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 4);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const schoolCode = `${baseCode}${randomSuffix}`;

    const bcryptRounds = this.config.get<number>('BCRYPT_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(dto.password, bcryptRounds);

    const result = await this.authRepo.prisma.$transaction(async (tx) => {
      // 1. Create School
      const school = await tx.school.create({
        data: {
          name: dto.institutionName,
          code: schoolCode,
          type: dto.type,
          country: dto.country,
        },
      });

      // 2. Create User linked to the new School
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          schoolId: school.id,
          roles: {
            create: {
              role: RoleType.SCHOOL_ADMIN,
              schoolId: school.id,
            },
          },
        },
      });

      return { user, school };
    });

    return this.issueTokens(result.user.id, result.user.email, result.school.id, [
      RoleType.SCHOOL_ADMIN,
    ]);
  }

  async login(dto: LoginDto) {
    const user = await this.authRepo.findUserByEmail(dto.email);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    // Check if account is hard-locked (requires admin unlock)
    const hardLocked = await this.redis.get(`login:hard-locked:${user.id}`);
    if (hardLocked) throw new UnauthorizedException('Account locked. Contact your administrator.');

    // Check if account is soft-locked (15-min cooldown)
    const softLocked = await this.redis.get(`login:locked:${user.id}`);
    if (softLocked)
      throw new UnauthorizedException('Too many failed attempts. Try again in 15 minutes.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.trackFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Clear all failure counters on successful login
    await this.redis.del(`login:fails:${user.id}`);
    await this.redis.del(`login:fails-1hr:${user.id}`);
    await this.authRepo.updateLastLogin(user.id);

    const roles = user.roles.map((r) => r.role);
    return this.issueTokens(user.id, user.email, user.schoolId, roles);
  }

  async refresh(userId: string, rawToken: string) {
    const stored = await this.authRepo.findRefreshToken(userId);
    if (!stored) throw new UnauthorizedException('No active session');

    const valid = await bcrypt.compare(rawToken, stored.tokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.authRepo.findUserById(userId);
    if (!user) throw new UnauthorizedException();

    const roles = user.roles.map((r) => r.role);
    return this.issueTokens(user.id, user.email, user.schoolId, roles);
  }

  async logout(userId: string, jti: string, tokenExp: number) {
    const ttl = tokenExp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await this.redis.setex(`blacklist:${jti}`, ttl, '1');
    await this.authRepo.deleteRefreshTokens(userId);
  }

  private async issueTokens(
    userId: string,
    email: string,
    schoolId: string | null,
    roles: string[],
  ) {
    const jti = uuidv4();
    const payload = { sub: userId, email, schoolId, roles, jti };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    const bcryptRounds = this.config.get<number>('BCRYPT_ROUNDS', 12);
    const refreshHash = await bcrypt.hash(refreshToken, bcryptRounds);

    const refreshExpiryDays = parseInt(
      this.config.get<string>('JWT_REFRESH_EXPIRY', '7d').replace('d', ''),
      10,
    );
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + refreshExpiryDays);
    await this.authRepo.saveRefreshToken(userId, schoolId, refreshHash, refreshExpires);

    return { accessToken, refreshToken };
  }

  private async trackFailedLogin(userId: string) {
    // Tier 1: 15-min window counter (soft lock at 10)
    const shortKey = `login:fails:${userId}`;
    const shortFails = await this.redis.incr(shortKey);
    await this.redis.expire(shortKey, 900); // 15 min TTL

    if (shortFails >= 10) {
      await this.redis.setex(`login:locked:${userId}`, 900, '1');
    }

    // Tier 2: 1-hr window counter (hard lock at 20 — requires admin unlock)
    const hourKey = `login:fails-1hr:${userId}`;
    const hourFails = await this.redis.incr(hourKey);
    await this.redis.expire(hourKey, 3600); // 1 hr TTL

    if (hourFails >= 20) {
      // Hard lock — no TTL, only an admin can clear this
      await this.redis.set(`login:hard-locked:${userId}`, '1');
    }
  }

  /** Called by Super Admin / School Admin to unlock a hard-locked account */
  async unlockAccount(userId: string): Promise<void> {
    await this.redis.del(`login:hard-locked:${userId}`);
    await this.redis.del(`login:locked:${userId}`);
    await this.redis.del(`login:fails:${userId}`);
    await this.redis.del(`login:fails-1hr:${userId}`);
  }

  /** Get user by ID */
  async getUserById(userId: string) {
    const user = await this.authRepo.findUserById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  /** Change user password */
  async changePassword(userId: string, newPassword: string): Promise<void> {
    const bcryptRounds = this.config.get<number>('BCRYPT_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(newPassword, bcryptRounds);

    await this.authRepo.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
