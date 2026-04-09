import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class AiRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findOrCreateConversation(userId: string, schoolId: string) {
    const existing = await this.prisma.aiConversation.findFirst({
      where: { userId, schoolId },
    });

    if (existing) return existing;

    return this.prisma.aiConversation.create({
      data: { userId, schoolId },
    });
  }

  async getMessages(conversationId: string, schoolId: string, limit: number) {
    return this.prisma.aiMessage.findMany({
      where: { conversationId, schoolId },
      orderBy: { sentAt: 'asc' },
      take: limit,
    });
  }

  async addMessage(data: {
    schoolId: string;
    conversationId: string;
    role: string;
    content: string;
  }) {
    return this.prisma.aiMessage.create({
      data,
    });
  }

  async getUserConversations(userId: string, schoolId: string) {
    return this.prisma.aiConversation.findMany({
      where: { userId, schoolId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
