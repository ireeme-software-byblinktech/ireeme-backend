import { Controller, Get, Patch, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { GradesService } from './grades.service';
import { GradeSubmissionDto, AppealDto, ResolveAppealDto } from './dto/grade-submission.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('grades')
@ApiBearerAuth()
@Controller('grades')
export class GradesController {
  constructor(private readonly service: GradesService) {}

  @Patch('submissions/:submissionId/grade')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Post score + feedback → triggers notification' })
  grade(@CurrentUser() user: JwtPayload, @Param('submissionId', ParseUUIDPipe) id: string, @Body() dto: GradeSubmissionDto) {
    return this.service.gradeSubmission(id, user.sub, user.schoolId!, dto);
  }

  @Get('student/:studentId/:termId')
  @Roles(RoleType.STUDENT, RoleType.PARENT, RoleType.SCHOOL_ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'All grades + GPA for a student/term' })
  studentGrades(
    @CurrentUser() user: JwtPayload,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('termId', ParseUUIDPipe) termId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.service.getStudentGrades(studentId, termId, user.schoolId!, +page, +limit);
  }

  @Post(':id/appeal')
  @Roles(RoleType.STUDENT)
  @ApiOperation({ summary: 'Submit grade appeal' })
  appeal(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AppealDto) {
    return this.service.submitAppeal(id, dto);
  }

  @Patch(':id/appeal/:status')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Approve or reject appeal' })
  resolveAppeal(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolveAppealDto) {
    return this.service.resolveAppeal(id, dto);
  }
}
