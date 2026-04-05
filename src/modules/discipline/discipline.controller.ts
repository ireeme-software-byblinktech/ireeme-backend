import {
  Controller, Get, Post, Patch, Body, Param,
  Query, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { DisciplineService } from './discipline.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { CreateOffenseTypeDto } from './dto/create-offense-type.dto';
import { AppealCaseDto } from './dto/appeal-case.dto';
import { QueryCasesDto } from './dto/query-cases.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('discipline')
@ApiBearerAuth()
@Controller('discipline')
export class DisciplineController {
  constructor(private readonly service: DisciplineService) {}

  // ── Offense types ──────────────────────────────────────────────────────────

  @Get('offense-types')
  @ApiOperation({ summary: 'List all offense types for the school' })
  findOffenseTypes(@CurrentUser() user: JwtPayload) {
    return this.service.findAllOffenseTypes(user.schoolId!);
  }

  @Post('offense-types')
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.DISCIPLINE_OFFICER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an offense type' })
  createOffenseType(@CurrentUser() user: JwtPayload, @Body() dto: CreateOffenseTypeDto) {
    return this.service.createOffenseType(user.schoolId!, dto);
  }

  // ── Cases ──────────────────────────────────────────────────────────────────

  @Get('cases')
  @Roles(RoleType.DISCIPLINE_OFFICER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Paginated list of discipline cases' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryCasesDto) {
    return this.service.findAll(user.schoolId!, query);
  }

  @Post('cases')
  @Roles(RoleType.DISCIPLINE_OFFICER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log a discipline case with offense + description + evidence' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCaseDto) {
    return this.service.create(user.schoolId!, user.sub, dto);
  }

  @Get('cases/:id')
  @Roles(RoleType.DISCIPLINE_OFFICER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get discipline case by ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id, user.schoolId!);
  }

  @Patch('cases/:id/close')
  @Roles(RoleType.DISCIPLINE_OFFICER)
  @ApiOperation({ summary: 'Mark a discipline case as resolved' })
  close(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.close(id, user.schoolId!);
  }

  // ── Appeals ────────────────────────────────────────────────────────────────

  @Post('cases/:id/appeal')
  @Roles(RoleType.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Student submits appeal for a discipline case' })
  submitAppeal(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AppealCaseDto,
  ) {
    return this.service.submitAppeal(id, user.schoolId!, dto);
  }

  @Patch('cases/:id/appeal/:status')
  @Roles(RoleType.DISCIPLINE_OFFICER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Resolve a discipline appeal (APPROVED or REJECTED)' })
  @ApiParam({ name: 'status', enum: ['APPROVED', 'REJECTED'] })
  resolveAppeal(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status') status: 'APPROVED' | 'REJECTED',
  ) {
    return this.service.resolveAppeal(id, user.schoolId!, status);
  }
}
