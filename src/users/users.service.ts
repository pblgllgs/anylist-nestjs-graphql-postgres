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
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { SearchArgs } from '../common/dto/args/search.args';

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

  async findAll(
    roles: ValidRoles[],
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<User[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;
    if (roles.length === 0) return await this.userRepository.find();
    const queryBuilder = this.userRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles);

    if (search) {
      queryBuilder.andWhere('LOWER("fullName") like :fullName', {
        fullName: `%${search.toLowerCase()}%`,
      });
    }

    return await queryBuilder.getMany();
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

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneByOrFail({ id });
      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    adminUser: User,
  ): Promise<User> {
    try {
      const user = await this.userRepository.preload({ id });
      if (updateUserInput.email !== user.email) {
        const isUsed = await this.isUsedEmail(updateUserInput.email);
        if (isUsed) {
          throw new BadRequestException(
            `User ${updateUserInput.email} already exists`,
          );
        }
      }
      const userUpdated = {
        ...user,
        ...updateUserInput,
      };
      userUpdated.lastUpdateBy = adminUser;
      userUpdated.password = bcrypt.hashSync(updateUserInput.password, 10);
      return await this.userRepository.save(userUpdated);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async block(id: string, adminUser: User): Promise<User> {
    try {
      const user = await this.findOneById(id);
      const updatedUser = this.userRepository.create({
        ...user,
        isActive: !user.isActive,
        lastUpdateBy: adminUser,
      });
      await this.userRepository.update(user.id, updatedUser);
      return updatedUser;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private async isUsedEmail(email: string): Promise<boolean> {
    const validEmail = await this.userRepository.find({
      where: {
        email: email,
      },
    });
    if (validEmail.length === 0) return false;
    return true;
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
