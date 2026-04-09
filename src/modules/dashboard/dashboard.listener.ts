import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DashboardService } from './dashboard.service';

@Injectable()
export class DashboardListener {
  constructor(private readonly dashboardService: DashboardService) {}

  @OnEvent('grade.posted')
  async handleGradePosted(payload: { studentId: string }) {
    await this.dashboardService.invalidateStudentCache(payload.studentId);
  }

  @OnEvent('assignment.created')
  async handleAssignmentCreated(payload: { schoolId: string }) {
    // Current strategy: invalidate all student caches for the school
    // This ensures consistency when a new assignment is posted
    await this.dashboardService.invalidateSchoolCaches(payload.schoolId);
  }
}
