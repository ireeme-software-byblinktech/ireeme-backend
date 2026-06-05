import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('teachers')
@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) { }

  // Specific routes first (before @Get/:id)
  @Get('subjects/taught')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Get subjects taught by current teacher' })
  getTeacherSubjects(@CurrentUser() user: JwtPayload) {
    return this.teachersService.getTeacherSubjects(user.sub, user.schoolId!);
  }

  @Get('details')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Get current teacher details' })
  getDetails(@CurrentUser() user: JwtPayload) {
    return this.teachersService.getDetails(user.sub, user.schoolId!);
  }

  @Get('dashboard/stats')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Get teacher dashboard statistics' })
  getDashboardStats(@CurrentUser() user: JwtPayload) {
    return this.teachersService.getDashboardStats(user.sub, user.schoolId!);
  }

  @Get('performance')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Get teacher class performance metrics' })
  getPerformance(@CurrentUser() user: JwtPayload) {
    return this.teachersService.getPerformance(user.sub, user.schoolId!);
  }

  @Get('students')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Get students in teacher classes' })
  getStudents(@CurrentUser() user: JwtPayload) {
    return this.teachersService.getStudents(user.sub, user.schoolId!);
  }

  @Get('classes/assigned')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Get classes assigned to teacher' })
  getAssignedClasses(@CurrentUser() user: JwtPayload) {
    return this.teachersService.getAssignedClasses(user.sub, user.schoolId!);
  }

  @Get('timetable')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Get teacher timetable upload' })
  getTimetable(@CurrentUser() user: JwtPayload) {
    return this.teachersService.getTimetable(user.sub, user.schoolId!);
  }

  @Get('timetable-slots')
  @Roles(RoleType.TEACHER)
  @ApiOperation({ summary: 'Get teacher timetable slots for weekly schedule' })
  getTimetableSlots(@CurrentUser() user: JwtPayload) {
    return this.teachersService.getTimetableSlots(user.sub, user.schoolId!);
  }

  // Generic routes after specific routes
  @Get()
  @Roles(RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'List all teachers' })
  findAll(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 25) {
    return this.teachersService.findAll(user.schoolId!, +page, +limit);
  }

  @Get(':id')
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'Get teacher profile' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.findById(id, user.schoolId!);
  }

  // POST routes
  @Post()
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create teacher + user account' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTeacherDto) {
    return this.teachersService.create(user.schoolId!, dto);
  }

  @Post('timetable')
  @Roles(RoleType.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload teacher timetable' })
  uploadTimetable(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { fileKey: string; fileName: string; fileType: string }
  ) {
    return this.teachersService.uploadTimetable(user.sub, user.schoolId!, dto);
  }

  @Post(':id/subjects/:subjectId')
  @Roles(RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Assign subject to teacher' })
  assignSubject(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
  ) {
    return this.teachersService.assignSubject(id, user.schoolId!, subjectId);
  }

  // PATCH routes
  @Patch(':id')
  @Roles(RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update teacher profile' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, user.schoolId!, dto);
  }

  // DELETE routes
  @Delete('timetable/:id')
  @Roles(RoleType.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete teacher timetable' })
  deleteTimetable(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.teachersService.deleteTimetable(id, user.sub, user.schoolId!);
  }

  @Delete(':id/subjects/:subjectId')
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove subject from teacher' })
  removeSubject(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
  ) {
    return this.teachersService.removeSubject(id, user.schoolId!, subjectId);
  }

  @Delete(':id')
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate teacher (soft delete)' })
  deactivate(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.deactivate(id, user.schoolId!);
  }
}
