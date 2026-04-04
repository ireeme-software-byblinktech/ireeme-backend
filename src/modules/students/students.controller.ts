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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'Paginated student list (school-scoped)' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryStudentDto) {
    return this.studentsService.findAll(user.schoolId!, query);
  }

  @Post()
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create student + user account (atomic)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateStudentDto) {
    return this.studentsService.create(user.schoolId!, dto);
  }

  @Get(':id')
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'Full student profile (404 if wrong school)' })
  @ApiParam({ name: 'id', type: String })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentsService.findById(id, user.schoolId!);
  }

  @Patch(':id')
  @Roles(RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update student profile fields' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, user.schoolId!, dto);
  }

  @Get(':id/dashboard')
  @Roles(RoleType.STUDENT)
  @ApiOperation({ summary: 'Aggregated student dashboard (Redis cached 5 min)' })
  getDashboard(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentsService.getDashboard(id, user.schoolId!);
  }
}
