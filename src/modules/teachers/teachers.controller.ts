import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
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
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @Roles(RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'List all teachers' })
  findAll(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 25) {
    return this.teachersService.findAll(user.schoolId!, +page, +limit);
  }

  @Post()
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create teacher + user account' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTeacherDto) {
    return this.teachersService.create(user.schoolId!, dto);
  }

  @Get(':id')
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'Get teacher profile' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.findById(id, user.schoolId!);
  }

  @Patch(':id')
  @Roles(RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update teacher profile' })
  update(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(id, user.schoolId!, dto);
  }

  @Post(':id/subjects/:subjectId')
  @Roles(RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Assign subject to teacher' })
  assignSubject(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Param('subjectId', ParseUUIDPipe) subjectId: string) {
    return this.teachersService.assignSubject(id, user.schoolId!, subjectId);
  }

  @Delete(':id/subjects/:subjectId')
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove subject from teacher' })
  removeSubject(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Param('subjectId', ParseUUIDPipe) subjectId: string) {
    return this.teachersService.removeSubject(id, user.schoolId!, subjectId);
  }
}
