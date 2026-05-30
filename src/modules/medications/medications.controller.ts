import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('medications')
@ApiBearerAuth()
@Controller('medications')
export class MedicationsController {
  constructor(private readonly service: MedicationsService) {}

  @Post()
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add new medication to inventory' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateMedicationDto) {
    return this.service.create(user.schoolId!, dto);
  }

  @Get()
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get all medications for the school' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
  ) {
    return this.service.findAll(user.schoolId!, +page, +limit);
  }

  @Get(':id')
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get medication by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update medication' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleType.NURSE, RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete medication' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
