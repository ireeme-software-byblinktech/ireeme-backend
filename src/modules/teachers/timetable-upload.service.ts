import { Injectable } from '@nestjs/common';
import { TimetableUploadRepository } from './timetable-upload.repository';

@Injectable()
export class TimetableUploadService {
  constructor(private repository: TimetableUploadRepository) {}

  async uploadTimetable(teacherId: string, schoolId: string, data: {
    fileUrl: string;
    fileName: string;
    fileType: string;
  }) {
    return this.repository.createTimetableUpload(teacherId, schoolId, data);
  }

  async getTimetable(teacherId: string) {
    return this.repository.getTimetableUpload(teacherId);
  }

  async deleteTimetable(id: string, teacherId: string) {
    return this.repository.deleteTimetableUpload(id, teacherId);
  }
}
