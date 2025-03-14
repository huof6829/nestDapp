import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { WalletModule } from './wallet/wallet.module';
import { TradeModule } from './trade/trade.module';
import { SolanaGateway } from './solana.gateway';
import { envConfig } from './common/config/env.config';
import { LoggerModule } from './common/logger/logger.module';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionEntity } from './trade/entities/transaction.entity';
import { WalletEntity } from './wallet/entities/wallet.entity';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: envConfig.cache.url,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: envConfig.database.host,
      port: envConfig.database.port,
      username: envConfig.database.username,
      password: envConfig.database.password,
      database: envConfig.database.dbname,
      entities: [
        __dirname + '/**/*.entity{.ts,.js}',
        TransactionEntity,
        WalletEntity,
      ],
      synchronize: true,
    }),
    JwtModule.register({
      global: true,
      secret: envConfig.jwt.jwtSecret,
      signOptions: { expiresIn: '1h' },
    }),
    WalletModule,
    TradeModule,
    TypeOrmModule.forFeature([TransactionEntity]),
    LoggerModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, SolanaGateway],
})
export class AppModule {}
