import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('schools')
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all schools (Super Admin only)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 25) {
    return this.schoolsService.findAll(+page, +limit);
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get school by ID' })
  findOne(@Param('id') id: string) {
    return this.schoolsService.findById(id);
  }

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new school' })
  create(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.create(dto);
  }
}
