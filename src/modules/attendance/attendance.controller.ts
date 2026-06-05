import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import { MarkBulkAttendanceDto } from './dto/mark-attendance.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post('mark-bulk')
  @Roles(RoleType.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mark attendance for whole class on a date (upsert)' })
  markBulk(@CurrentUser() user: JwtPayload, @Body() dto: MarkBulkAttendanceDto) {
    return this.service.markBulk(user.schoolId!, user.sub, dto);
  }

  @Get('student/:studentId')
  @Roles(RoleType.STUDENT, RoleType.PARENT, RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Paginated attendance history for a student' })
  findByStudent(
    @CurrentUser() user: JwtPayload,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 25,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.service.findByStudent(studentId, user.schoolId!, +page, +limit, subjectId);
  }

  @Get('summary/:studentId')
  @Roles(RoleType.STUDENT, RoleType.PARENT, RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Attendance % by subject for a student in a date range' })
  calculateSummary(
    @CurrentUser() user: JwtPayload,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.service.calculateSummary(studentId, user.schoolId!, from, to);
  }

  @Get('daily-summary')
  @Roles(RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Daily attendance summary for a class' })
  getDailySummary(
    @CurrentUser() user: JwtPayload,
    @Query('date') date: string,
    @Query('classId', ParseUUIDPipe) classId: string,
  ) {
    return this.service.getDailySummary(user.schoolId!, date, classId);
  }

  @Get('teacher/daily')
  @Roles(RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get attendance records for teacher\'s students on a specific date' })
  getTeacherDailyAttendance(
    @CurrentUser() user: JwtPayload,
    @Query('date') date: string,
  ) {
    return this.service.getTeacherDailyAttendance(user.schoolId!, user.sub, date);
  }

  @Patch(':id')
  @Roles(RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update attendance record status' })
  updateAttendanceStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: { status: string },
  ) {
    return this.service.updateAttendanceStatus(user.schoolId!, user.sub, id, dto.status);
  }
}

