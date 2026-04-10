import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { ElectionsService } from './elections.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { AddCandidateDto } from './dto/add-candidate.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('elections')
@ApiBearerAuth()
@Controller('elections')
export class ElectionsController {
  constructor(private readonly service: ElectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all elections in the school' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.service.findAll(user.schoolId!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get election details with positions and candidates' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id, user.schoolId!);
  }

  @Post()
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new election (Admin only)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateElectionDto) {
    return this.service.createElection(user.schoolId!, dto);
  }

  @Post('candidates')
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a candidate to a position (Admin only)' })
  addCandidate(@CurrentUser() user: JwtPayload, @Body() dto: AddCandidateDto) {
    return this.service.addCandidate(user.schoolId!, dto);
  }

  @Post('vote')
  @Roles(RoleType.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cast a vote for a position (Student only)' })
  vote(@CurrentUser() user: JwtPayload, @Body() dto: CastVoteDto) {
    return this.service.castVote(user.schoolId!, user.sub, dto);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get current election results' })
  getResults(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getResults(id, user.schoolId!);
  }
}
