import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { AiService } from './ai.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { IsString, MinLength } from 'class-validator';

class ChatMessageDto {
  @IsString()
  @MinLength(1)
  content: string;
}

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('chat')
  @Roles(RoleType.STUDENT)
  @HttpCode(HttpStatus.OK)
  chat(@CurrentUser() user: JwtPayload, @Body() body: ChatMessageDto) {
    return this.service.chat(user.sub, user.schoolId!, body.content);
  }

  @Get('history')
  @Roles(RoleType.STUDENT)
  @ApiOperation({ summary: 'Get student chat history' })
  getHistory(@CurrentUser() user: JwtPayload) {
    return this.service.getHistory(user.sub, user.schoolId!);
  }
}
