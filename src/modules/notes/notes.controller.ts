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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('notes')
@ApiBearerAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly service: NotesService) {}

  @Get()
  @Roles(RoleType.TEACHER, RoleType.STUDENT, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get all notes with optional filters' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('subject') subject?: string,
    @Query('grade') grade?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    // If teacher, filter by their notes only
    const createdById = user.roles?.includes(RoleType.TEACHER) ? user.sub : undefined;
    return this.service.findAll(user.schoolId!, {
      subject,
      grade,
      type,
      search,
      createdById,
    });
  }

  @Get(':id')
  @Roles(RoleType.TEACHER, RoleType.STUDENT, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get note by ID' })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(id, user.schoolId!);
  }

  @Post()
  @Roles(RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new note' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateNoteDto) {
    return this.service.create(user.schoolId!, user.sub, dto);
  }

  @Patch(':id')
  @Roles(RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update a note' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.service.update(id, user.schoolId!, dto);
  }

  @Delete(':id')
  @Roles(RoleType.TEACHER, RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a note' })
  delete(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id, user.schoolId!);
  }

  @Patch(':id/increment-views')
  @Roles(RoleType.TEACHER, RoleType.STUDENT, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Increment view count for a note' })
  incrementViews(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.incrementViews(id, user.schoolId!);
  }

  @Patch(':id/increment-downloads')
  @Roles(RoleType.TEACHER, RoleType.STUDENT, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Increment download count for a note' })
  incrementDownloads(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.incrementDownloads(id, user.schoolId!);
  }
}
