import { Controller, Get, Patch, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { GradesService } from './grades.service';
import { CreateGradeDto, GradeSubmissionDto, AppealDto, ResolveAppealDto } from './dto/grade-submission.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('grades')
@ApiBearerAuth()
@Controller('grades')
export class GradesController {
  constructor(private readonly service: GradesService) {}

  @Post()
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Post score + feedback → triggers notification' })
  gradePost(@CurrentUser() user: JwtPayload, @Body() dto: CreateGradeDto) {
    return this.service.gradeSubmission(dto.submissionId, user.sub, user.schoolId!, dto);
  }

  @Patch('submissions/:submissionId/grade')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Legacy endpoint: Post score + feedback via patch' })
  grade(@CurrentUser() user: JwtPayload, @Param('submissionId', ParseUUIDPipe) id: string, @Body() dto: GradeSubmissionDto) {
    return this.service.gradeSubmission(id, user.sub, user.schoolId!, dto);
  }

  @Get('student/:studentId/:termId')
  @Roles(RoleType.STUDENT, RoleType.PARENT, RoleType.SCHOOL_ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'All grades + GPA for a student/term' })
  findByStudentTerm(
    @CurrentUser() user: JwtPayload,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('termId', ParseUUIDPipe) termId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.service.findByStudentTerm(studentId, termId, user.schoolId!, +page, +limit);
  }

  @Post(':id/appeal')
  @Roles(RoleType.STUDENT)
  @ApiOperation({ summary: 'Submit grade appeal' })
  appeal(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AppealDto) {
    return this.service.submitAppeal(id, user.schoolId!, dto);
  }

  @Patch(':id/appeal/:status')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Approve or reject appeal' })
  resolveAppeal(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolveAppealDto) {
    return this.service.resolveAppeal(id, user.schoolId!, dto);
  }
}
