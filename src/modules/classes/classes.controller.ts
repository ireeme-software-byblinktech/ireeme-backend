import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { AddStudentDto } from './dto/add-student.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'List all classes' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.classesService.findAll(user.schoolId!);
  }

  @Post()
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateClassDto) {
    return this.classesService.create(user.schoolId!, dto);
  }

  @Get(':id')
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER)
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.findById(id, user.schoolId!);
  }

  @Patch(':id')
  @Roles(RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update a class' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateClassDto>,
  ) {
    return this.classesService.update(id, user.schoolId!, dto);
  }

  @Delete(':id')
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a class' })
  remove(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.remove(id, user.schoolId!);
  }

  @Post(':id/students')
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a student to a class' })
  addStudent(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddStudentDto,
  ) {
    return this.classesService.addStudent(id, user.schoolId!, dto.studentId);
  }

  @Delete(':id/students/:studentId')
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a student from a class' })
  removeStudent(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) classId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.classesService.removeStudent(classId, user.schoolId!, studentId);
  }
}
