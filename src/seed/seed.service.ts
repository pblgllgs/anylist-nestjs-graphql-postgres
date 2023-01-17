import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SEED_USERS, SEED_ITEMS, SEED_LIST } from './data/seed-data';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { List } from '../list/entities/list.entity';
import { ListItem } from '../list-item/entities/list-item.entity';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListItemService } from '../list-item/list-item.service';
import { ListService } from '../list/list.service';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UsersService,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    private readonly itemService: ItemsService,
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    private readonly listItemService: ListItemService,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    private readonly listService: ListService,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  async executeSeed() {
    if (this.isProd) {
      throw new UnauthorizedException('No autorizado!!');
    }
    await this.deleteDatabase();
    const user = await this.loadUsers();
    await this.loadItems(user);
    const list = await this.loadList(user);
    const items = await this.itemService.findAll(
      user,
      { limit: 15, offset: 0 },
      {},
    );
    await this.loadListItem(list, items);
    return true;
  }

  async deleteDatabase(): Promise<void> {
    await this.listItemRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    await this.listRepository.createQueryBuilder().delete().where({}).execute();
    await this.itemRepository.createQueryBuilder().delete().where({}).execute();
    await this.userRepository.createQueryBuilder().delete().where({}).execute();
  }

  async loadUsers(): Promise<User> {
    const users = [];
    for (const user of SEED_USERS) {
      users.push(await this.userService.create(user));
    }
    return users[0];
  }

  async loadItems(user: User): Promise<void> {
    const itemsPromises = [];
    for (const item of SEED_ITEMS) {
      itemsPromises.push(
        this.itemService.create(
          { name: item.name, quantityUnits: item.quantityUnits },
          user,
        ),
      );
    }
    await Promise.all(itemsPromises);
  }

  async loadList(user: User): Promise<List> {
    const listPromises = [];
    for (const list of SEED_LIST) {
      listPromises.push(await this.listService.create(list, user));
    }
    return listPromises[0];
  }

  async loadListItem(list: List, items: Item[]): Promise<void> {
    for (const item of items) {
      this.listItemService.create({
        quantity: Math.round(Math.random() * 10),
        completed: Math.round(Math.random() * 1) === 0 ? false : true,
        listId: list.id,
        itemId: item.id,
      });
    }
  }
}
