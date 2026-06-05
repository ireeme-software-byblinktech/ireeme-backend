import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { TimetableService } from './timetable.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('timetable')
@ApiBearerAuth()
@Controller('timetable')
export class TimetableController {
  constructor(private readonly service: TimetableService) { }

  @Get('mine')
  @ApiOperation({ summary: 'Get timetable for current student/teacher' })
  getMyTimetable(@CurrentUser() user: JwtPayload) {
    return this.service.findByUser(user);
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's schedule for current user" })
  getTodaySchedule(@CurrentUser() user: JwtPayload) {
    return this.service.getTodaySchedule(user);
  }

  @Get('student/:studentId')
  @Roles(RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get timetable for a student' })
  byStudent(
    @CurrentUser() user: JwtPayload,
    @Param('studentId') studentId: string,
  ) {
    return this.service.findByStudent(user.schoolId!, studentId);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get timetable for a class' })
  byClass(
    @CurrentUser() user: JwtPayload,
    @Param('classId') classId: string,
  ) {
    return this.service.findByClass(user.schoolId!, classId);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Get timetable for a teacher' })
  byTeacher(
    @CurrentUser() user: JwtPayload,
    @Param('teacherId') teacherId: string,
  ) {
    return this.service.findByTeacher(user.schoolId!, teacherId);
  }

  @Post()
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSlotDto) {
    return this.service.create(user.schoolId!, dto);
  }

  @Delete(':id')
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.delete(user.schoolId!, id);
  }
}
