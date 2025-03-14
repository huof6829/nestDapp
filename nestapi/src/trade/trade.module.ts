import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { TransactionEntity } from './entities/transaction.entity';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [TradeController],
  providers: [TradeService, JwtAuthGuard], // 注册
})
export class TradeModule {}
