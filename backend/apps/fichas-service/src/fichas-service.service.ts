import { Injectable } from '@nestjs/common';

@Injectable()
export class FichasServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
