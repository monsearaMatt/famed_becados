import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async signJWT( payload: JwtPayload ) {
    return this.jwtService.signAsync( payload );
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, nombre, password, rut, apellido } = registerUserDto;
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User alreadsy exists',
        });
      }
      const newUser =  await this.usersRepository.create({
        nombre,
        apellido,
        email,
        rut,
        password: bcrypt.hashSync(password, 10),
      });

      await this.usersRepository.save(newUser);

      const { password: __, ...rest } = newUser;

      return {
        user: rest,
        token: await this.signJWT( 
          { 
            userId: newUser.id,
            email: newUser.email,
            rol: newUser.rol
          }
        )
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password,} = loginUserDto;
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User/Password incorrect',
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/Password incorrect',
        });
      }

      const { password: __, ...rest } = user;

      return {
        user: rest,
        token: await this.signJWT( 
          { 
            userId: user.id,
            email: user.email,
            rol: user.rol
          }
        ) 
      };

    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      })

      return {
        user: user,
        token: await this.signJWT( user )
      };

    } catch (error) {
      throw new RpcException({
        status: 401,
        message: 'Invalid token',
      });
    }
  }
}
