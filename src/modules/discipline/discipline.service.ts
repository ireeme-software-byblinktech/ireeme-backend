import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DisciplineRepository } from './discipline.repository';
import { CreateCaseDto } from './dto/create-case.dto';
import { CreateOffenseTypeDto } from './dto/create-offense-type.dto';
import { AppealCaseDto } from './dto/appeal-case.dto';
import { QueryCasesDto } from './dto/query-cases.dto';

@Injectable()
export class DisciplineService {
  constructor(
    private readonly repo: DisciplineRepository,
    private readonly events: EventEmitter2,
  ) {}

  // ── Offense types ──────────────────────────────────────────────────────────

  findAllOffenseTypes(schoolId: string) {
    return this.repo.findAllOffenseTypes(schoolId);
  }

  createOffenseType(schoolId: string, dto: CreateOffenseTypeDto) {
    return this.repo.createOffenseType({ schoolId, ...dto });
  }

  // ── Cases ──────────────────────────────────────────────────────────────────

  findAll(schoolId: string, query: QueryCasesDto) {
    return this.repo.findAll(schoolId, query.page!, query.limit!, query.studentId, query.status);
  }

  async findById(id: string, schoolId: string) {
    const c = await this.repo.findById(id, schoolId);
    if (!c) throw new NotFoundException('Discipline case not found');
    return c;
  }

  async create(schoolId: string, officerId: string, dto: CreateCaseDto) {
    const disciplineCase = await this.repo.create({ schoolId, officerId, ...dto });
    this.events.emit('discipline.case.opened', {
      studentId: dto.studentId,
      schoolId,
      caseId: disciplineCase.id,
    });
    return disciplineCase;
  }

  async close(id: string, schoolId: string) {
    await this.findById(id, schoolId);
    return this.repo.updateStatus(id, 'CLOSED');
  }

  // ── Appeals ────────────────────────────────────────────────────────────────

  async submitAppeal(caseId: string, schoolId: string, dto: AppealCaseDto) {
    await this.findById(caseId, schoolId);
    const existing = await this.repo.findAppeal(caseId);
    if (existing) throw new ConflictException('Appeal already submitted for this case');
    return this.repo.createAppeal(caseId, schoolId, dto.reason);
  }

  async resolveAppeal(caseId: string, schoolId: string, status: 'APPROVED' | 'REJECTED') {
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      throw new BadRequestException('Appeal status must be APPROVED or REJECTED');
    }
    await this.findById(caseId, schoolId);
    const appeal = await this.repo.findAppeal(caseId);
    if (!appeal) throw new NotFoundException('No appeal found for this case');
    return this.repo.updateAppeal(caseId, status);
  }
}
