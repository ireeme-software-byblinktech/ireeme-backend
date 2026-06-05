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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RoleType, HomePermissionStatus } from '@prisma/client';
import { HomePermissionsService } from './home-permissions.service';
import { CreateHomePermissionDto } from './dto/create-home-permission.dto';
import { UpdateHomePermissionDto } from './dto/update-home-permission.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('home-permissions')
@ApiBearerAuth()
@Controller('home-permissions')
export class HomePermissionsController {
  constructor(private readonly service: HomePermissionsService) {}

  @Post()
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new home permission' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateHomePermissionDto) {
    return this.service.create(user.schoolId!, user.sub, dto);
  }

  @Get()
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get all home permissions for the school' })
  @ApiQuery({ name: 'status', enum: HomePermissionStatus, required: false })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('status') status?: HomePermissionStatus,
  ) {
    return this.service.findAll(user.schoolId!, +page, +limit, status);
  }

  @Get('stats')
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get statistics for home permissions' })
  getStats(@CurrentUser() user: JwtPayload) {
    return this.service.getStats(user.schoolId!);
  }

  @Get(':id')
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get home permission by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update home permission' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHomePermissionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete home permission' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
