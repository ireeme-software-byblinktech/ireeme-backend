import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { SubmissionsService } from './submissions.service';
import { SubmitSubmissionDto } from './dto/submit-submission.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('submissions')
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @Roles(RoleType.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit an assignment' })
  submit(@CurrentUser() user: JwtPayload, @Body() dto: SubmitSubmissionDto) {
    return this.submissionsService.submit(user.sub, user.schoolId!, dto);
  }

  @Get(':id')
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER, RoleType.STUDENT)
  @ApiOperation({ summary: 'Get submission details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.submissionsService.findById(id);
  }
}
