import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
// import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger('ProductService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.userRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(): Promise<User[]> {
    return [];
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ email });
    } catch (error) {
      this.handleDBExceptions({
        code: 'errr-001',
        detail: `${email} not found`,
      });
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) throw new NotFoundException(`Not exist user with id: ${id}`);
      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // update(id: number, updateUserInput: UpdateUserInput) {
  //   return `This action updates a #${id} user`;
  // }

  block(id: string): Promise<User> {
    throw new Error('not implemented');
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    if (error.code === 'errr-001') {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException('Check server logs');
  }
}
