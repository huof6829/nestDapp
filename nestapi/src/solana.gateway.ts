import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Connection, PublicKey } from '@solana/web3.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './trade/entities/transaction.entity';
import { envConfig } from './common/config/env.config';
import { CustomLoggerService } from './common/logger/logger.service';

@WebSocketGateway(envConfig.ports.websocket)
export class SolanaGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext(SolanaGateway.name);
    this.connectToSolana();
  }

  private connectToSolana() {
    const connection = new Connection(envConfig.solana.rpcUrl);

    connection.onAccountChange(
      new PublicKey(envConfig.solana.watchedAddress),
      (accountInfo) => {
        const transaction = new TransactionEntity();
        transaction.data = accountInfo.data.toString();
        transaction.timestamp = new Date();

        //insert
        this.transactionRepository
          .save(transaction)
          .then(() => {})
          .catch((error) => {
            const message = error instanceof Error ? error.message : 'unknow';
            this.logger.error(`Failed to save transaction: ${message}`);
          });
      },
    );
  }
}
