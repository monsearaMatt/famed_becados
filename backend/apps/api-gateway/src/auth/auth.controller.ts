import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs/operators';
import { LoginUserDto, RegisterUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { Token, User } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(@Inject('NATS_SERVICE') private readonly client: ClientProxy) {}

  private async sendRpc(pattern: string, data: any): Promise<any> {
    return this.client.send(pattern, data).pipe(
      catchError((error) => {
        if (error instanceof RpcException) {
          const rpcError = error.getError();
          const message = typeof rpcError === 'string' ? rpcError : (rpcError as any).message || 'Error';
          const status = typeof rpcError === 'object' && (rpcError as any).status ? (rpcError as any).status : 500;
          throw new HttpException(message, status);
        } else if (error && typeof error === 'object' && (error as any).status) {
          throw new HttpException((error as any).message || 'Error', (error as any).status);
        } else {
          throw new HttpException('Internal server error', 500);
        }
      }),
    ).toPromise();
  }

  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.sendRpc('auth.register.user', registerUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.sendRpc('auth.login.user', loginUserDto);
  }

  @UseGuards(AuthGuard)
    @Get('verify')
  verifyToken(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.sendRpc('auth.verify.token', token);
  }
}
