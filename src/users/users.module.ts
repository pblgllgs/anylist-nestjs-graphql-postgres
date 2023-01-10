import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsModule } from '../items/items.module';
import { ListService } from '../list/list.service';
import { ListModule } from '../list/list.module';

@Module({
  providers: [UsersResolver, UsersService, ListService],
  imports: [TypeOrmModule.forFeature([User]), ItemsModule, ListModule],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
