import { Controller, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CustomLoggerService } from '../common/logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from './entities/wallet.entity';

@Controller('api/wallet')
export class WalletController {
  constructor(
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    private readonly walletService: WalletService,
    private readonly logger: CustomLoggerService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext(WalletController.name);
  }

  @Post('login')
  async login(
    @Body('wallet') wallet: string,
    @Body('signature') signature: string,
    @Res() res: Response,
  ) {
    const isValid = await this.walletService.verifySignature(wallet, signature);

    if (isValid) {
      const entity = new WalletEntity();
      entity.wallet = wallet;
      entity.timestamp = new Date();

      //insert
      this.walletRepository
        .save(entity)
        .then(() => {})
        .catch((error) => {
          const message = error instanceof Error ? error.message : 'unknow';
          this.logger.error(`Failed to save wallet: ${message}`);
        });

      const payload = { wallet };
      const token = this.jwtService.sign(payload);

      return res.status(HttpStatus.OK).json({
        code: 0,
        message: '成功',
        data: { isSuccess: true, token: token },
      });
    }

    this.logger.error(`Login failed for wallet: ${wallet}`);

    return res.status(HttpStatus.BAD_REQUEST).json({
      code: 1001,
      message: '签名验证失败',
      data: { isSuccess: false },
    });
  }
}
