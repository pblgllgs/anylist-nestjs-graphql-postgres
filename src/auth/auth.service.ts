import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { SignupInput, LoginInput } from './dto/inputs';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(id: string) {
    return this.jwtService.sign({ id });
  }

  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    const user = await this.usersService.create(signupInput);
    const token = this.getJwtToken(user.id);
    return {
      user,
      token,
    };
  }

  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException(`Not found ${email}`);
    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestException(`Wrong credentials`);
    const token = this.getJwtToken(user.id);
    return {
      user,
      token,
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user.isActive)
      throw new UnauthorizedException(
        `User is inactive, talk with the administrator`,
      );
    delete user.password;
    return user;
  }

  revalidateToken(user: User): AuthResponse {
    return {
      user,
      token: this.getJwtToken(user.id),
    };
  }
}
