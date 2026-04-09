import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { StudentsRepository } from '../students/students.repository';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly studentsRepo: StudentsRepository,
  ) {}

  @Get('student')
  @Roles(RoleType.STUDENT)
  @ApiOperation({ summary: 'Get aggregated student dashboard with caching' })
  async getStudentDashboard(@CurrentUser() user: JwtPayload) {
    const student = await this.studentsRepo.findByUserId(user.sub, user.schoolId!);
    if (!student) {
        return { message: 'Student profile not found' };
    }
    return this.dashboardService.aggregateStudentDashboard(student.id, user.schoolId!);
  }
}
