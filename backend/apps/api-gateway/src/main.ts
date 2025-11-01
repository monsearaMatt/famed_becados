import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const logger = new Logger('Main-ApiGateway');

  const app = await NestFactory.create(AppModule);

  // Configuración de CORS
  app.enableCors({
    origin: [
      'http://localhost:3001',  // Frontend en desarrollo/Docker
      'http://localhost:3000',  // Por si accedes directo
      'http://frontend-pc:3001', // Nombre del contenedor Docker
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Accept',
  });

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
