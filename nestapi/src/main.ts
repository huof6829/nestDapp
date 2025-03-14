import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from './common/config/env.config';
import { CustomLoggerService } from './common/logger/logger.service';
import { HttpExceptionFilter } from './common/exception/http.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLoggerService(),
  });
  app.useGlobalFilters(new HttpExceptionFilter(new CustomLoggerService()));
  await app.listen(envConfig.ports.http);
  console.log(`Application is running on port ${envConfig.ports.http}`);
}
bootstrap();
