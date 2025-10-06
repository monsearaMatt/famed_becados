import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

async create(createUserDto: any): Promise<User> {
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(createUserDto.password, salt);

  const newUser = new User();
  newUser.email = createUserDto.email;
  newUser.nombre = createUserDto.nombre;
  newUser.passwordHash = passwordHash;
  newUser.email = createUserDto.email;
  
  return this.usersRepository.save(newUser);
}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

    async findbyRut(rut: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { rut } });
    return user ?? undefined;
  }
}