import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { UploadsService } from '../uploads/uploads.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessageType } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(
    private readonly repository: MessagesRepository,
    private readonly uploadsService: UploadsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendMessage(
    schoolId: string,
    senderId: string,
    convId: string,
    content?: string,
    files: Express.Multer.File[] = [],
  ) {
    // 1. Security Check
    const isMember = await this.repository.isMember(schoolId, convId, senderId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    const trimmedContent = content?.trim();
    if (!trimmedContent && files.length === 0) {
      throw new BadRequestException('Message content or files required');
    }

    // 2. Upload Files & Type Detection
    const s3Keys: string[] = [];
    let messageType: MessageType = MessageType.TEXT;

    if (files.length > 0) {
      for (const file of files) {
        const { key } = await this.uploadsService.upload(file, schoolId, senderId, 'messages');
        s3Keys.push(key);
        
        if (file.mimetype.startsWith('audio/')) {
          messageType = MessageType.VOICE;
        } else if (messageType !== MessageType.VOICE) {
          messageType = MessageType.FILE;
        }
      }
    } else {
      messageType = MessageType.TEXT;
    }

    const message = await this.repository.create({
      schoolId,
      convId,
      senderId,
      content: trimmedContent || '',
      fileUrls: s3Keys,
      type: messageType,
    });

    const signedFileUrls = await Promise.all(
      message.fileUrls.map((key) => this.uploadsService.getSignedUrl(key)),
    );

    const payload = { 
      ...message, 
      fileUrls: signedFileUrls 
    };

    // 5. Emit Events (Gateway & NotificationsModule)
    this.eventEmitter.emit('message.new', payload);
    
    const recipients = await this.repository.findConversationMembers(schoolId, convId);
    this.eventEmitter.emit('notification.send', {
      schoolId,
      recipientIds: recipients.filter(id => id !== senderId),
      type: 'MESSAGE',
      title: 'New Message',
      body: content || 'Shared a file',
      data: { convId, messageId: message.id }
    });

    return payload;
  }

  async getMessages(
    schoolId: string,
    userId: string,
    convId: string,
    page: number = 1,
    limit: number = 25,
  ) {
    // Security: School isolation + Membership
    const isMember = await this.repository.isMember(schoolId, convId, userId);
    if (!isMember) {
      throw new ForbiddenException('Forbidden access to conversation');
    }

    const skip = (page - 1) * limit;
    // Fetch one extra to determine if there is a next page
    const messages = await this.repository.findManyByConversation(
      schoolId,
      convId,
      skip,
      limit + 1,
    );

    const hasNextPage = messages.length > limit;
    const paginatedMessages = hasNextPage ? messages.slice(0, limit) : messages;

    // Transform S3 Keys into clickable Signed URLs (only for paginated slice)
    const data = await Promise.all(
      paginatedMessages.map(async (msg) => ({
        ...msg,
        fileUrls: await Promise.all(
          msg.fileUrls.map((key) => this.uploadsService.getSignedUrl(key)),
        ),
      })),
    );

    return {
      data,
      meta: {
        page,
        limit,
        hasNextPage,
      },
    };
  }
}
