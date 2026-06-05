import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Req,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Messaging')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachments'))
  @ApiOperation({ summary: 'Send a new message with optional attachments' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden access to conversation' })
  async sendMessage(
    @Req() req: any,
    @Body() dto: SendMessageDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { schoolId, sub: userId } = req.user;
    return this.messagesService.sendMessage(
      schoolId,
      userId,
      dto.convId,
      dto.content,
      files,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all user conversations' })
  @ApiResponse({ status: 200, description: 'List of conversations retrieved' })
  async getConversations(@Req() req: any) {
    const { schoolId, sub: userId } = req.user;
    return this.messagesService.getConversations(schoolId, userId);
  }

  @Get('contacts/teacher')
  @ApiOperation({ summary: 'Get available contacts for teacher (excludes students)' })
  @ApiResponse({ status: 200, description: 'List of contacts retrieved' })
  async getTeacherContacts(@Req() req: any) {
    const { schoolId, sub: userId } = req.user;
    return this.messagesService.getTeacherContacts(schoolId, userId);
  }

  @Post('conversation/start')
  @ApiOperation({ summary: 'Start or get existing conversation with a user' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved or created' })
  async startConversation(@Req() req: any, @Body() body: { recipientId: string }) {
    const { schoolId, sub: userId } = req.user;
    return this.messagesService.startConversation(schoolId, userId, body.recipientId);
  }

  @Get('messages/:convId')
  @ApiOperation({ summary: 'Get paginated messages for a conversation' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 25 })
  @ApiResponse({
    status: 200,
    description: 'Paginated messages retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            hasNextPage: { type: 'boolean' },
          },
        },
      },
    },
  })
  async getMessages(
    @Req() req: any,
    @Param('convId') convId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    if (limit > 100) {
      throw new BadRequestException('Query limit cannot exceed 100');
    }

    const { schoolId, sub: userId } = req.user;
    return this.messagesService.getMessages(
      schoolId,
      userId,
      convId,
      page,
      limit,
    );
  }
}

