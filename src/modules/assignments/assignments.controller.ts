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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { QueryAssignmentDto } from './dto/query-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('assignments')
@ApiBearerAuth()
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List assignments (filter by subjectId or teacherId)' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryAssignmentDto) {
    return this.service.findAll(user.schoolId!, query.subjectId, query.teacherId);
  }

  @Post()
  @Roles(RoleType.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create assignment' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAssignmentDto) {
    return this.service.create(user.schoolId!, user.sub, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id, user.schoolId!);
  }

  @Patch(':id')
  @Roles(RoleType.TEACHER)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.service.update(id, user.schoolId!, dto);
  }

  @Post(':id/submit')
  @Roles(RoleType.STUDENT)
  @ApiOperation({ summary: 'Submit assignment (student)' })
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.service.submit(id, user.sub, user.schoolId!, dto);
  }
}
