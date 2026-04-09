import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { ParentsService } from './parents.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ChildOwnershipGuard } from '../../common/guards/child-ownership.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('parents')
@ApiBearerAuth()
@Controller('parents')
@Roles(RoleType.PARENT)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('children')
  @ApiOperation({ summary: 'List all verified children for the parent' })
  async getChildren(@CurrentUser() user: JwtPayload) {
    return this.parentsService.getChildren(user.sub);
  }

  @Get('children/:studentId/overview')
  @UseGuards(ChildOwnershipGuard)
  @ApiOperation({ summary: 'Get overview of grades and attendance for a specific child' })
  async getChildOverview(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.parentsService.getChildOverview(studentId);
  }

  @Get('children/:studentId/fees')
  @UseGuards(ChildOwnershipGuard)
  @ApiOperation({ summary: 'Get fee history and status for a child' })
  async getChildFees(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.parentsService.getChildFees(studentId);
  }

  @Post('children/:studentId/permissions')
  @UseGuards(ChildOwnershipGuard)
  @ApiOperation({ summary: 'Submit a leave or permission request for a child' })
  async submitPermission(
    @CurrentUser() user: JwtPayload,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body() dto: CreatePermissionDto,
  ) {
    return this.parentsService.submitPermission(user.sub, studentId, dto);
  }
}
