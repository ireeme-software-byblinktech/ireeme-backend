import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from './strategies/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive access token' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token' })
  async refresh(@Body() dto: RefreshDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Accept from body or cookie
    const token = dto.refreshToken || req.cookies?.refresh_token;
    // userId must come from the expired access token — client sends it in body for simplicity
    const { accessToken, refreshToken } = await this.authService.refresh(
      (req as any).userId,
      token,
    );
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and blacklist token' })
  async logout(@CurrentUser() user: JwtPayload, @Res({ passthrough: true }) res: Response) {
    const exp = (this.parseJwt(user) as any).exp ?? 0;
    await this.authService.logout(user.sub, user.jti, exp);
    res.clearCookie('refresh_token');
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user from token' })
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }

  private parseJwt(user: JwtPayload): object {
    return user as unknown as object;
  }
}
