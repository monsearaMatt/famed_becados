import { Controller, Get } from '@nestjs/common';
import { FichasServiceService } from './fichas-service.service';

@Controller()
export class FichasServiceController {
  constructor(private readonly fichasServiceService: FichasServiceService) {}

  @Get()
  getHello(): string {
    return this.fichasServiceService.getHello();
  }
}
