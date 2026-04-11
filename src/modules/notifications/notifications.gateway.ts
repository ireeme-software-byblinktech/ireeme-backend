import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  maxHttpBufferSize: 1e6, // 1MB max message size
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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

      // Join personal and school rooms
      client.join(`user:${payload.sub}`);
      if (payload.schoolId) {
        client.join(`school:${payload.schoolId}`);
      }

      client.data.userId = payload.sub;
      client.data.schoolId = payload.schoolId;

      this.logger.log(`Client connected to notifications: ${client.id} (user:${payload.sub})`);
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
      this.logger.log(`Client disconnected from notifications: ${client.id}`);
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth?.token;
    if (auth) return auth;
    const query = client.handshake.query?.token;
    if (query) return query as string;
    return null;
  }

  /** Push notification to a specific user */
  notifyUser(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('notification', data);
  }

  /** Broadcast notification to an entire school */
  notifySchool(schoolId: string, data: any) {
    this.server.to(`school:${schoolId}`).emit('notification', data);
  }

  /**
   * Get number of connected users
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }
}
