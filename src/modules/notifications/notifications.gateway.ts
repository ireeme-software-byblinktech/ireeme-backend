import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: '*' },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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

      // Join personal and school rooms
      client.join(`user:${payload.sub}`);
      if (payload.schoolId) {
        client.join(`school:${payload.schoolId}`);
      }

      this.logger.log(`Client connected to notifications: ${client.id} (user:${payload.sub})`);
    } catch (err) {
      this.logger.error(`Connection verification failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from notifications: ${client.id}`);
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
}
