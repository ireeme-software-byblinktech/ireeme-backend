import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
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
  constructor(private readonly service: TimetableService) {}

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get timetable for a class' })
  byClass(@Param('classId', ParseUUIDPipe) classId: string) {
    return this.service.findByClass(classId);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Get timetable for a teacher' })
  byTeacher(@Param('teacherId', ParseUUIDPipe) teacherId: string) {
    return this.service.findByTeacher(teacherId);
  }

  @Post()
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSlotDto) { return this.service.create(dto); }

  @Delete(':id')
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) { return this.service.delete(id); }
}
