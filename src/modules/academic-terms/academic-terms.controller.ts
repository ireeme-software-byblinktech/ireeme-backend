import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { AcademicTermsService } from './academic-terms.service';
import { CreateTermDto } from './dto/create-term.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('academic-terms')
@ApiBearerAuth()
@Controller('academic-terms')
export class AcademicTermsController {
  constructor(private readonly service: AcademicTermsService) {}

  @Get()
  @ApiOperation({ summary: 'List all terms' })
  findAll(@CurrentUser() user: JwtPayload) { return this.service.findAll(user.schoolId!); }

  @Get('active')
  @ApiOperation({ summary: 'Get current active term' })
  findActive(@CurrentUser() user: JwtPayload) { return this.service.findActive(user.schoolId!); }

  @Post()
  @Roles(RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTermDto) {
    return this.service.create(user.schoolId!, dto);
  }

  @Patch(':id')
  @Roles(RoleType.SCHOOL_ADMIN)
  update(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateTermDto>) {
    return this.service.update(id, user.schoolId!, dto);
  }
}
