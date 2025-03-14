import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomLoggerService } from '../logger/logger.service';
import { envConfig } from '../config/env.config';
import { Request } from 'express';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../../wallet/entities/wallet.entity';

interface JwtPayload {
  wallet: string;
  iat?: number;
  exp?: number;
}

// 扩展
declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
  ) {}

  async getWalletById(id: number): Promise<string | null> {
    const redisKey = `user:id:${id}`;
    const wallet: string | null = await this.redis.hget(redisKey, 'wallet');

    if (wallet) {
      return wallet;
    }

    const walletEntity = await this.walletRepository.findOne({
      where: { id },
    });
    if (walletEntity) {
      await this.redis.hset(redisKey, 'wallet', walletEntity.wallet);
      return walletEntity.wallet;
    }

    return null;
  }

  async getUseridByWallet(wallet: string): Promise<string | null> {
    const redisKey = `user:wallet:${wallet}`;
    const id: string | null = await this.redis.get(redisKey);

    if (id) {
      return id;
    }

    const walletEntity = await this.walletRepository.findOne({
      where: { wallet },
    });
    if (walletEntity) {
      await this.redis.set(redisKey, walletEntity.id);
      return walletEntity.id.toString();
    }

    return null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['authorization'];
    if (!token) {
      this.logger.error('No Authorization header provided');
      throw new UnauthorizedException('Authorization header is missing');
    }

    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: envConfig.jwt.jwtSecret,
      });
      this.logger.log(`JWT token verified for wallet: ${decoded.wallet}`);

      const id = await this.getUseridByWallet(decoded.wallet);
      if (id === null) {
        this.logger.error(`Wallet ${decoded.wallet} never logged in`);
        throw new UnauthorizedException('Wallet never logged in');
      }

      request.user = decoded;
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      this.logger.error(`JWT verification failed: ${message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
