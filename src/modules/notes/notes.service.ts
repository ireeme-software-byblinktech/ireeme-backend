import { Injectable } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly repo: NotesRepository) {}

  findAll(
    schoolId: string,
    filters: {
      subject?: string;
      grade?: string;
      type?: string;
      search?: string;
      createdById?: string;
    },
  ) {
    return this.repo.findAll(schoolId, filters);
  }

  findOne(id: string, schoolId: string) {
    return this.repo.findOne(id, schoolId);
  }

  create(schoolId: string, createdById: string, dto: CreateNoteDto) {
    return this.repo.create(schoolId, createdById, dto);
  }

  update(id: string, schoolId: string, dto: UpdateNoteDto) {
    return this.repo.update(id, schoolId, dto);
  }

  delete(id: string, schoolId: string) {
    return this.repo.delete(id, schoolId);
  }

  incrementViews(id: string, schoolId: string) {
    return this.repo.incrementViews(id, schoolId);
  }

  incrementDownloads(id: string, schoolId: string) {
    return this.repo.incrementDownloads(id, schoolId);
  }
}
