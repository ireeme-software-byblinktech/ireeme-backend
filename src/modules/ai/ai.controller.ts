import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
@Roles(RoleType.STUDENT)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send message to AI assistant (Daily limit applies)' })
  async chat(@CurrentUser() user: JwtPayload, @Body() dto: ChatMessageDto) {
    return this.aiService.sendMessage(user.sub, user.schoolId!, dto.content);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get AI chat history' })
  async history(@CurrentUser() user: JwtPayload) {
    return this.aiService.getHistory(user.sub, user.schoolId!);
  }
}
