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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { PermissionsService } from './permissions.service';
import { SubmitPermissionDto } from './dto/submit-permission.dto';
import { QueryPermissionsDto } from './dto/query-permissions.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Post()
  @Roles(RoleType.STUDENT, RoleType.PARENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a new permission request' })
  submit(@CurrentUser() user: JwtPayload, @Body() dto: SubmitPermissionDto) {
    // If student is submitting, ensure they submit for themselves
    return this.service.submit(user.schoolId!, user.sub, dto);
  }

  @Get()
  @Roles(RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'List permission requests with filters (Staff only)' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryPermissionsDto) {
    return this.service.findAll(user.schoolId!, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission request details' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id, user.schoolId!);
  }

  @Patch(':id/approve')
  @Roles(RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Approve a permission request' })
  approve(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.approve(user.schoolId!, id, user.sub);
  }

  @Patch(':id/reject')
  @Roles(RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Reject a permission request' })
  reject(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.reject(user.schoolId!, id, user.sub);
  }
}
