import { NestFactory } from '@nestjs/core';
import { FichasServiceModule } from './fichas-service.module';

async function bootstrap() {
  const app = await NestFactory.create(FichasServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
