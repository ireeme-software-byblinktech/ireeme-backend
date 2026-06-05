import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TimetableUploadRepository {
  constructor(private prisma: PrismaService) {}

  async createTimetableUpload(teacherId: string, schoolId: string, data: {
    fileUrl: string;
    fileName: string;
    fileType: string;
  }) {
    // First, delete any existing timetable upload for this teacher
    await this.prisma.timetableUpload.deleteMany({
      where: {
        teacherId,
      },
    });

    return this.prisma.timetableUpload.create({
      data: {
        teacherId,
        schoolId,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileType: data.fileType,
      },
    });
  }

  async getTimetableUpload(teacherId: string) {
    return this.prisma.timetableUpload.findFirst({
      where: {
        teacherId,
      },
    });
  }

  async deleteTimetableUpload(id: string, teacherId: string) {
    return this.prisma.timetableUpload.deleteMany({
      where: {
        id,
        teacherId,
      },
    });
  }
}
