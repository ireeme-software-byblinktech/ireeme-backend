import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../../config/redis.module';

export interface JwtPayload {
  sub: string;
  email: string;
  schoolId: string | null;
  roles: string[];
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Check token blacklist (logout)
    const blacklisted = await this.redis.get(`blacklist:${payload.jti}`);
    if (blacklisted) throw new UnauthorizedException('Token has been revoked');
    return payload;
  }
}
