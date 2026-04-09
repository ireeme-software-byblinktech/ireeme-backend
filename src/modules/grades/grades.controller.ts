import { Controller, Get, Patch, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType, AppealStatus } from '@prisma/client';
import { GradesService } from './grades.service';
import { AppealsService } from './appeals.service';
import { SubmitAppealDto } from './dto/submit-appeal.dto';
import { ReviewAppealDto } from './dto/review-appeal.dto';
import { CreateGradeDto, GradeSubmissionDto, AppealDto, ResolveAppealDto } from './dto/grade-submission.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('grades')
@ApiBearerAuth()
@Controller('grades')
export class GradesController {
  constructor(
    private readonly service: GradesService,
    private readonly appealsService: AppealsService,
  ) { }

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
  submitAppeal(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) gradeId: string,
    @Body() dto: SubmitAppealDto,
  ) {
    return this.appealsService.submit(user.sub, gradeId, dto.reason, user.schoolId!);
  }

  @Patch('appeals/:appealId')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Review grade appeal (REVIEWING, APPROVED, REJECTED)' })
  reviewAppeal(
    @CurrentUser() user: JwtPayload,
    @Param('appealId', ParseUUIDPipe) appealId: string,
    @Body() dto: ReviewAppealDto,
  ) {
    return this.appealsService.reviewAppeal(appealId, dto.status, user.sub, user.schoolId!);
  }

  @Get('appeals')
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'List all grade appeals (paginated, max 50 per page)' })
  listAppeals(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.appealsService.findAll(user.schoolId!, +page, +limit);
  }
}
