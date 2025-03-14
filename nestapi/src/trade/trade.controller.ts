import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TradeService } from './trade.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CustomLoggerService } from '../common/logger/logger.service';
import { Request } from 'express';

@Controller('api/trade')
export class TradeController {
  constructor(
    private readonly tradeService: TradeService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext(TradeController.name);
  }

  @Post('question')
  @UseGuards(JwtAuthGuard)
  async getAnswer(@Body('question') question: string, @Req() request: Request) {
    const wallet = request.user?.wallet;
    this.logger.log(`Received question: ${question} from wallet: ${wallet}`);
    try {
      const answer = await this.tradeService.getOpenAIAnswer(question);
      return {
        code: 0,
        message: '成功',
        data: { answer },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      return {
        code: 1001,
        message: `错误: ${message}`,
        data: { answer: '' },
      };
    }
  }

  @Get('recommend')
  async getRecommendations(@Query('kind') kind: string) {
    const recommendations = await this.tradeService.getRecommendations(kind);
    return {
      code: 0,
      message: '成功',
      data: recommendations,
    };
  }
}
