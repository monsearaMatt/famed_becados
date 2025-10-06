import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.create')
  handleUserCreate(@Payload() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern('users.findByEmail')
  handleUserFindByEmail(@Payload() email: string) {
    return this.usersService.findByEmail(email);
  }

    @MessagePattern('users.findByRut')
  handleUserFindByRut(@Payload() rut: string) {
    return this.usersService.findByEmail(rut);
  }
}