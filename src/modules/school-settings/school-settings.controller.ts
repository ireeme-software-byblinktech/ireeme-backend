import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { SchoolSettingsService } from './school-settings.service';
import { UpdateSchoolSettingsDto } from './dto/update-school-settings.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('school-settings')
@ApiBearerAuth()
@Controller('school-settings')
export class SchoolSettingsController {
  constructor(private readonly service: SchoolSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get school settings' })
  getSettings(@CurrentUser() user: JwtPayload) {
    return this.service.findBySchool(user.schoolId!);
  }

  @Patch()
  @Roles(RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update school settings (time slots, etc.)' })
  updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateSchoolSettingsDto,
  ) {
    return this.service.update(user.schoolId!, dto);
  }
}
