import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';

@WebSocketGateway({
  namespace: 'messages',
  cors: { origin: '*' },
})
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly repository: MessagesRepository,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
      });

      // Join a private room for the user
      client.join(`user:${payload.sub}`);
      this.logger.log(`User ${payload.sub} connected to messaging gateway`);
    } catch (err) {
      client.disconnect();
    }
  }

  @OnEvent('message.new')
  async handleMessageCreated(payload: any) {
    const { schoolId, convId, senderId } = payload;
    
    // Find all members of this conversation
    const members = await this.repository.findConversationMembers(schoolId, convId);

    // Emit the new message only to members
    members.forEach((memberId) => {
      this.server.to(`user:${memberId}`).emit('message.new', payload);
    });
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth?.token;
    if (auth) return auth;
    const query = client.handshake.query?.token;
    if (query) return query as string;
    return null;
  }
}
