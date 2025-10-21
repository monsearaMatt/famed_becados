import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {

  const logger = new Logger('Main-ApiGateway');

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  logger.log(`API Gateway is running on port: ${process.env.PORT ?? 3000}`);

}
bootstrap();
