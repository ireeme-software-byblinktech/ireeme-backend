import {
  Controller, Get, Post, Patch, Body, Param,
  Query, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RoleType, AppointmentStatus } from '@prisma/client';
import { HealthService } from './health.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateMedicalCaseDto } from './dto/create-medical-case.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('health')
@ApiBearerAuth()
@Controller('health')
export class HealthController {
  constructor(private readonly service: HealthService) {}

  // ── Health records ─────────────────────────────────────────────────────────

  @Post('records')
  @Roles(RoleType.NURSE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create health record for a student visit' })
  createRecord(@CurrentUser() user: JwtPayload, @Body() dto: CreateHealthRecordDto) {
    return this.service.createRecord(user.schoolId!, user.sub, dto);
  }

  @Get('records/student/:studentId')
  @Roles(RoleType.NURSE, RoleType.STUDENT, RoleType.PARENT)
  @ApiOperation({ summary: 'Full health history for a student' })
  findRecords(
    @CurrentUser() user: JwtPayload,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 25,
  ) {
    return this.service.findRecordsByStudent(studentId, user.schoolId!, +page, +limit);
  }

  // ── Medical cases ──────────────────────────────────────────────────────────

  @Post('medical-cases')
  @Roles(RoleType.NURSE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Open a medical case for a student' })
  createMedicalCase(@CurrentUser() user: JwtPayload, @Body() dto: CreateMedicalCaseDto) {
    return this.service.createMedicalCase(user.schoolId!, dto);
  }

  @Get('medical-cases/student/:studentId')
  @Roles(RoleType.NURSE, RoleType.STUDENT, RoleType.PARENT)
  @ApiOperation({ summary: 'Get all medical cases for a student' })
  findMedicalCases(
    @CurrentUser() user: JwtPayload,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.service.findMedicalCasesByStudent(studentId, user.schoolId!);
  }

  @Patch('medical-cases/:id/close')
  @Roles(RoleType.NURSE)
  @ApiOperation({ summary: 'Close a medical case' })
  closeMedicalCase(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.closeMedicalCase(id);
  }

  // ── Appointments ───────────────────────────────────────────────────────────

  @Post('appointments')
  @Roles(RoleType.NURSE, RoleType.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule a health appointment' })
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.service.createAppointment(dto);
  }

  @Get('appointments/student/:studentId')
  @Roles(RoleType.NURSE, RoleType.STUDENT, RoleType.PARENT)
  @ApiOperation({ summary: 'Get appointments for a student' })
  findAppointments(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 25,
  ) {
    return this.service.findAppointmentsByStudent(studentId, +page, +limit);
  }

  @Patch('appointments/:id/status')
  @Roles(RoleType.NURSE)
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiParam({ name: 'id', type: String })
  updateAppointmentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status: AppointmentStatus,
  ) {
    return this.service.updateAppointmentStatus(id, status);
  }
}
