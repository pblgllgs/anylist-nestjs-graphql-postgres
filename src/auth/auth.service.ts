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

  // async revalidateToken(token: string): Promise<string> {
  //   try {
  //     const payload = this.jwtService.decode(token);
  //     const user = await this.usersService.findOne(payload['id']);
  //     return this.jwtService.sign({ id: user.id }, { expiresIn: 60 * 60 * 24 });
  //   } catch (error) {
  //     throw new UnauthorizedException(`Can't revalidate token, see logs`);
  //   }
  // }
}
