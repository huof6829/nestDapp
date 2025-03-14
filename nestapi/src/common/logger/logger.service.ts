import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { TransformableInfo } from 'logform';
import { envConfig } from '../config/env.config';

interface LogInfo extends TransformableInfo {
  timestamp: string;
}

@Injectable({ scope: Scope.TRANSIENT }) // 确保每个模块有独立的上下文
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;
  private context: string;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info', // 日志级别
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf((info: LogInfo) => {
          const context = this.context || 'Global';
          return `${info.timestamp} [${info.level.toUpperCase()}] [${context}]: ${info.message as string}`;
        }),
      ),
      transports: [
        // 控制台输出
        new winston.transports.Console(),
        // 文件输出（按天分割）
        new DailyRotateFile({
          filename: envConfig.log.filename,
          datePattern: envConfig.log.datePattern,
          maxSize: envConfig.log.maxSize,
          maxFiles: envConfig.log.maxFiles,
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(`${message}${trace ? ` - ${trace}` : ''}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
