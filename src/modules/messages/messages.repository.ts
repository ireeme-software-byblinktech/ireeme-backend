import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Message, MessageType, Prisma } from '@prisma/client';

@Injectable()
export class MessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MessageUncheckedCreateInput): Promise<Message> {
    return this.prisma.message.create({
      data,
    });
  }

  async findManyByConversation(
    schoolId: string,
    convId: string,
    skip: number,
    take: number,
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        schoolId,
        convId,
      },
      skip,
      take,
      orderBy: {
        sentAt: 'desc',
      },
    });
  }

  async isMember(schoolId: string, convId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.conversationMember.findFirst({
      where: {
        schoolId,
        convId,
        userId,
      },
      select: {
        id: true,
      },
    });
    return !!member;
  }

  async findConversationMembers(schoolId: string, convId: string): Promise<string[]> {
    const members = await this.prisma.conversationMember.findMany({
      where: {
        schoolId,
        convId,
      },
      select: {
        userId: true,
      },
    });
    return members.map((m) => m.userId);
  }
}
