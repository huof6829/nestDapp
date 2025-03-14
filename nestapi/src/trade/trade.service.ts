import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import OpenAI from 'openai';
import { envConfig } from '../common/config/env.config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { CustomLoggerService } from '../common/logger/logger.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TradeService {
  private openai: OpenAI;
  private apiKeys: string[];
  private currentKeyIndex: number;

  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRedis() private readonly redis: Redis,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext(TradeService.name);

    this.apiKeys = envConfig.openai.apiKeys;
    this.currentKeyIndex = 0;

    this.openai = new OpenAI({
      apiKey: this.apiKeys[this.currentKeyIndex],
    });

    this.initializeKeyStatuses();
  }

  private async initializeKeyStatuses(): Promise<void> {
    for (let index = 0; index < this.apiKeys.length; index++) {
      const statusKey = `openai:key:${index}:status`;
      await this.redis.del(statusKey);
    }
  }

  private async getNextAvailableKeyIndex(): Promise<number | null> {
    for (let i = 0; i < this.apiKeys.length; i++) {
      if (i !== this.currentKeyIndex) {
        const statusKey = `openai:key:${i}:status`;
        const status = await this.redis.get(statusKey);
        if (status === null) {
          return i;
        }
      }
    }

    return null;
  }

  private async switchToNextAvailableKey(): Promise<void> {
    const nextIndex = await this.getNextAvailableKeyIndex();
    if (nextIndex === null) {
      throw new Error('No available OpenAI API keys found.');
    }

    this.currentKeyIndex = nextIndex;
    this.openai = new OpenAI({
      apiKey: this.apiKeys[this.currentKeyIndex],
    });
    this.logger.log(`Switched to API key at index ${this.currentKeyIndex}`);
  }

  private async markKeyAsExhausted(index: number): Promise<void> {
    const statusKey = `openai:key:${index}:status`;
    await this.redis.set(statusKey, 'exhausted');
    this.logger.warn(`Marked API key at index ${index} as exhausted`);
  }

  async getOpenAIAnswer(question: string): Promise<string> {
    const maxRetries = this.apiKeys.length;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: question }],
        });
        return completion.choices[0].message.content || '';
      } catch (error) {
        if (error instanceof Error && error['status'] === 429) {
          this.logger.warn(
            `API key at index ${this.currentKeyIndex} hit rate limit.`,
          );
          await this.markKeyAsExhausted(this.currentKeyIndex);
          await this.switchToNextAvailableKey();
          retries++;
        } else {
          const message = error instanceof Error ? error.message : 'Unknown';
          throw new Error(`OpenAI API error: ${message}`);
        }
      }
    }

    throw new Error(
      'All OpenAI API keys have exceeded their quota or rate limit.',
    );
  }

  async getRecommendations(kind: string): Promise<any[]> {
    // select
    const transactions = await this.transactionRepository.find({
      where: { kind },
      order: { price: 'DESC' },
    });
    return transactions.map((t) => ({
      kind: t.kind,
      price: t.price,
    }));
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetKeyStatuses(): Promise<void> {
    this.logger.debug('Cron task run');
    for (let i = 0; i < this.apiKeys.length; i++) {
      const statusKey = `openai:key:${i}:status`;
      await this.redis.del(statusKey);
    }
    this.currentKeyIndex = 0;
    this.openai = new OpenAI({
      apiKey: this.apiKeys[this.currentKeyIndex],
    });
    this.logger.log('All OpenAI API key statuses reset');
  }
}
