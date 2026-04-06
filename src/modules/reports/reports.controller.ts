import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('report-cards')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get(':studentId/:termId')
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER, RoleType.PARENT, RoleType.STUDENT)
  @ApiOperation({ summary: 'Report card data + triggers PDF generation job (Sprint 2)' })
  getReportCard(
    @CurrentUser() user: JwtPayload,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('termId', ParseUUIDPipe) termId: string,
  ) {
    return this.service.getReportCard(studentId, termId, user.schoolId!);
  }
}
