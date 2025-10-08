import { Module } from '@nestjs/common';
import { FichasServiceController } from './fichas-service.controller';
import { FichasServiceService } from './fichas-service.service';

@Module({
  imports: [],
  controllers: [FichasServiceController],
  providers: [FichasServiceService],
})
export class FichasServiceModule {}
