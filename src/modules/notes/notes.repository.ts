import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findAll(
    schoolId: string,
    filters: {
      subject?: string;
      grade?: string;
      type?: string;
      search?: string;
      createdById?: string;
    },
  ) {
    const where: any = this.scopeToSchool(schoolId, {});

    if (filters.subject) {
      where.subject = filters.subject;
    }

    if (filters.grade) {
      where.grade = filters.grade;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { chapter: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string, schoolId: string) {
    return this.prisma.note.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
    });
  }

  create(schoolId: string, createdById: string, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        schoolId,
        createdById,
        title: dto.title,
        description: dto.description,
        subject: dto.subject,
        grade: dto.grade,
        chapter: dto.chapter,
        type: dto.type,
        fileUrl: dto.fileUrl || '',
        fileSize: dto.fileSize || '0 MB',
        views: 0,
        downloads: 0,
      },
    });
  }

  update(id: string, schoolId: string, dto: UpdateNoteDto) {
    return this.prisma.note.update({
      where: { id, schoolId },
      data: dto,
    });
  }

  delete(id: string, schoolId: string) {
    return this.prisma.note.delete({
      where: { id, schoolId },
    });
  }

  incrementViews(id: string, schoolId: string) {
    return this.prisma.note.update({
      where: { id, schoolId },
      data: { views: { increment: 1 } },
    });
  }

  incrementDownloads(id: string, schoolId: string) {
    return this.prisma.note.update({
      where: { id, schoolId },
      data: { downloads: { increment: 1 } },
    });
  }
}
