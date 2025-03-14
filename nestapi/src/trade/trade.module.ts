import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { TransactionEntity } from './entities/transaction.entity';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { WalletEntity } from '../wallet/entities/wallet.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, WalletEntity]),
    WalletModule,
  ],
  controllers: [TradeController],
  providers: [TradeService, JwtAuthGuard],
  exports: [TypeOrmModule.forFeature([TransactionEntity])],
})
export class TradeModule {}
