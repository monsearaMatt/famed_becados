import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const logger = new Logger('Main-ApiGateway');

  const app = await NestFactory.create(AppModule);


  app.setGlobalPrefix('api', {
    exclude: [{
      path: '',
      method: RequestMethod.GET,
    }]
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);

  logger.log(`API Gateway is running on port: ${process.env.PORT ?? 3000}`);

}
bootstrap();
