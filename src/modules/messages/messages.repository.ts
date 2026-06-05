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

  async findUserConversations(schoolId: string, userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        schoolId,
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { sentAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTeacherContacts(schoolId: string, userId: string) {
    // Get all users except STUDENT and the teacher themselves
    return this.prisma.user.findMany({
      where: {
        schoolId,
        id: { not: userId },
        NOT: {
          roles: {
            some: {
              role: 'STUDENT',
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        roles: {
          select: { role: true },
        },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  }

  async createOrGetConversation(schoolId: string, userId: string, recipientId: string) {
    // Find existing conversation between these two users
    const existing = await this.prisma.conversation.findFirst({
      where: {
        schoolId,
        members: {
          every: {
            userId: { in: [userId, recipientId] },
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        schoolId,
        members: {
          createMany: {
            data: [
              { schoolId, userId },
              { schoolId, userId: recipientId },
            ],
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }
}
