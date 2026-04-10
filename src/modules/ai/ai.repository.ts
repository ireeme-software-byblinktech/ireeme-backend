import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class AiRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findOrCreateConversation(userId: string, schoolId: string) {
    let conv = await this.prisma.aiConversation.findFirst({
      where: this.scopeToSchool(schoolId, { userId }),
    });

    if (!conv) {
      conv = await this.prisma.aiConversation.create({
        data: { userId, schoolId },
      });
    }

    return conv;
  }

  async addMessage(data: {
    schoolId: string;
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
  }) {
    return this.prisma.aiMessage.create({
      data,
    });
  }

  async getMessages(conversationId: string, schoolId: string, limit = 20) {
    return this.prisma.aiMessage.findMany({
      where: this.scopeToSchool(schoolId, { conversationId }),
      orderBy: { sentAt: 'asc' },
      take: limit,
    });
  }

  async getUserConversations(userId: string, schoolId: string) {
    return this.prisma.aiConversation.findMany({
      where: this.scopeToSchool(schoolId, { userId }),
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
