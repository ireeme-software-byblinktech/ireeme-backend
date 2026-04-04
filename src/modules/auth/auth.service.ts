import {
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { AuthRepository } from './auth.repository';
import { REDIS_CLIENT } from '../../config/redis.module';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.authRepo.findUserByEmail(dto.email);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.trackFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.redis.del(`login:fails:${user.id}`);
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
    await this.authRepo.saveRefreshToken(userId, refreshHash, refreshExpires);

    return { accessToken, refreshToken };
  }

  private async trackFailedLogin(userId: string) {
    const key = `login:fails:${userId}`;
    const fails = await this.redis.incr(key);
    await this.redis.expire(key, this.config.get<number>('RATE_LIMIT_TTL', 60) * 15);
    if (fails >= 10) {
      await this.redis.setex(`login:locked:${userId}`, 900, '1');
    }
  }
}
