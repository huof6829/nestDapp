import { Injectable } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import { envConfig } from '../common/config/env.config';
import { CustomLoggerService } from '../common/logger/logger.service';

@Injectable()
export class WalletService {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext(WalletService.name);
  }

  async verifySignature(wallet: string, signature: string): Promise<boolean> {
    try {
      const publicKey = new PublicKey(wallet);
      const signatureBuffer = Buffer.from(signature, 'base64');
      const message = Buffer.from(envConfig.solana.message);

      const connection = new Connection(envConfig.solana.rpcUrl);
      const accountInfo = await connection.getAccountInfo(publicKey);
      if (!accountInfo) {
        throw new Error('Invalid public key');
      }

      return nacl.sign.detached.verify(
        message,
        signatureBuffer,
        publicKey.toBuffer(),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Signature verification failed:${message}`);
      return false;
    }
  }
}
