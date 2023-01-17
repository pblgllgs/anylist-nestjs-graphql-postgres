import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';
import { UsersModule } from '../users/users.module';
import { ItemsModule } from '../items/items.module';
import { ConfigModule } from '@nestjs/config';
import { ListModule } from '../list/list.module';
import { ListItemModule } from '../list-item/list-item.module';

@Module({
  providers: [SeedResolver, SeedService],
  exports: [SeedService],
  imports: [UsersModule, ItemsModule, ConfigModule, ListModule, ListItemModule],
})
export class SeedModule {}
