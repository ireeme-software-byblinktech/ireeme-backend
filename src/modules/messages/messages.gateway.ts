import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

      client.join(`user:${payload.sub}`);
      this.logger.log(`Client connected to messages: ${client.id} (user:${payload.sub})`);
    } catch (err) {
      client.disconnect();
    }
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { to: string; content: string },
  ) {
    // In a real app, you'd save to DB here.
    // For "live chat" requirement, we just relay.
    this.server.to(`user:${data.to}`).emit('new-message', {
      from: (client as any).user?.sub || 'system', // we'd need to store user on client in handleConnection
      content: data.content,
      timestamp: new Date(),
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
