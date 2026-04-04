import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('subjects')
@ApiBearerAuth()
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List subjects (optionally filter by classId)' })
  findAll(@CurrentUser() user: JwtPayload, @Query('classId') classId?: string) {
    return this.subjectsService.findAll(user.schoolId!, classId);
  }

  @Post()
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(user.schoolId!, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.subjectsService.findById(id, user.schoolId!);
  }

  @Patch(':id')
  @Roles(RoleType.SCHOOL_ADMIN)
  update(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateSubjectDto>) {
    return this.subjectsService.update(id, user.schoolId!, dto);
  }
}
