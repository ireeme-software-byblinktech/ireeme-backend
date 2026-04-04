import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
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
  update(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateClassDto>) {
    return this.classesService.update(id, user.schoolId!, dto);
  }
}
