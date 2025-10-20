import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { UsersServiceModule } from './users-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main-UsersService');

  //const natsUrl = process.env.NATS_URL ?? 'nats://127.0.0.1:4222';   // Esta url se ocupo cuando se instancio solamente nats en docker (los micros servicios no se podian comunicar con nats pues no estaban en la misma red)
  const natsUrl = process.env.NATS_URL;
  if (!natsUrl) {
    throw new Error('NATS_URL no está definida en las variables de entorno.');
  }
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersServiceModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [natsUrl],
      },
    },
  );
  logger.log('Users microservice is listening on NATS server: ' + natsUrl);
  await app.listen();
}

bootstrap();
