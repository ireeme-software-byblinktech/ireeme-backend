import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { SuperAdminService } from './super-admin.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('super-admin')
@ApiBearerAuth()
@Roles(RoleType.SUPER_ADMIN)
@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly service: SuperAdminService) {}

  // ── Schools ────────────────────────────────────────────────────────────────

  @Get('schools')
  @ApiOperation({ summary: 'List all schools (SuperAdmin only)' })
  getSchools(@Query('page') page: number, @Query('limit') limit: number) {
    return this.service.listSchools(page, limit);
  }

  @Post('schools')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new school (SuperAdmin only)' })
  createSchool(@Body() dto: any) {
    return this.service.createSchool(dto);
  }

  @Patch('schools/:id')
  @ApiOperation({ summary: 'Update school details (SuperAdmin only)' })
  updateSchool(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateSchool(id, dto);
  }

  // ── Admins ─────────────────────────────────────────────────────────────────

  @Get('admins')
  @ApiOperation({ summary: 'List all school administrators (SuperAdmin only)' })
  getAdmins(@Query('page') page: number, @Query('limit') limit: number) {
    return this.service.listAdmins(page, limit);
  }

  @Post('admins')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new school administrator (SuperAdmin only)' })
  createAdmin(@Body() dto: any) {
    return this.service.createAdmin(dto);
  }
}
