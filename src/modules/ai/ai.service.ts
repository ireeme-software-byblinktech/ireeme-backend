import { Injectable, Inject, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import OpenAI from 'openai';
import { AiRepository } from './ai.repository';
import { REDIS_CLIENT } from '../../config/redis.module';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private readonly dailyLimit: number;

  constructor(
    private readonly repo: AiRepository,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk-placeholder-key-change-this') {
      this.openai = new OpenAI({ apiKey });
    }
    this.dailyLimit = this.config.get<number>('AI_DAILY_LIMIT', 10);
  }

  private getRateLimitKey(userId: string): string {
    const today = new Date().toISOString().split('T')[0];
    return `ai:limit:${userId}:${today}`;
  }

  async chat(userId: string, schoolId: string, content: string) {
    const limitKey = this.getRateLimitKey(userId);

    // 1. Rate Limit Check
    const currentUsage = await this.redis.get(limitKey);
    if (currentUsage && parseInt(currentUsage) >= this.dailyLimit) {
      throw new ForbiddenException(`Daily AI message limit reached (${this.dailyLimit})`);
    }

    // 2. Aggregate Context
    const conversation = await this.repo.findOrCreateConversation(userId, schoolId);
    const history = await this.repo.getMessages(conversation.id, schoolId, 10);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: 'You are a helpful academic assistant for Blink Campus, a school management system. Help students with their subjects and school life.' },
      ...history.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content },
    ];

    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    const isMock = !this.openai || !apiKey || apiKey === 'sk-placeholder-key-change-this';

    try {
      let assistantMessage: string;

      if (isMock) {
        // Simulated AI response for development/testing
        assistantMessage = `(Mock AI Mode) I received: "${content}". Configure a real 'OPENAI_API_KEY' in .env for actual AI responses.`;
      } else {
        // 3. Call AI
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
        });
        assistantMessage = response.choices[0].message.content || 'I am sorry, I could not generate a response.';
      }

      // 4. Persistence
      await this.repo.addMessage({
        schoolId,
        conversationId: conversation.id,
        role: 'user',
        content,
      });

      const savedResponse = await this.repo.addMessage({
        schoolId,
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantMessage,
      });

      // 5. Increment Rate Limit
      await this.redis.incr(limitKey);
      await this.redis.expire(limitKey, 86400); // 24 hours

      return savedResponse;
    } catch (error) {
      console.error('AI Error:', error);
      throw new InternalServerErrorException('Failed to communicate with AI assistant');
    }
  }

  async getHistory(userId: string, schoolId: string) {
    const conversations = await this.repo.getUserConversations(userId, schoolId);
    if (conversations.length === 0) return [];

    // For now returning the most recent conversation's full history
    return this.repo.getMessages(conversations[0].id, schoolId, 50);
  }
}
