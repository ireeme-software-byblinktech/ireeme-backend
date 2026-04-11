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
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  maxHttpBufferSize: 1e6, // 1MB max message size
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private readonly connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly repository: MessagesRepository,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
      });

      // Store user connection
      if (!this.connectedUsers.has(payload.sub)) {
        this.connectedUsers.set(payload.sub, new Set());
      }
      this.connectedUsers.get(payload.sub)!.add(client.id);

      // Join a private room for the user
      client.join(`user:${payload.sub}`);
      client.data.userId = payload.sub;
      
      this.logger.log(`User ${payload.sub} connected to messaging gateway (${client.id})`);
    } catch (err) {
      this.logger.error(`Connection verification failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const userSockets = this.connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(userId);
        }
      }
      this.logger.log(`User ${userId} disconnected from messaging gateway (${client.id})`);
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

  /**
   * Get number of connected users
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }
}
