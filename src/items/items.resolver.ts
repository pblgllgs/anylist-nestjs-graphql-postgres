import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Resolver(() => Item)
@UseGuards(JwtAuthGuard)
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Mutation(() => Item, { name: 'createItem' })
  async createItem(
    @CurrentUser() user: User,
    @Args('createItemInput') createItemInput: CreateItemInput,
  ): Promise<Item> {
    return this.itemsService.create(createItemInput, user);
  }

  @Query(() => [Item], { name: 'items' })
  async findAll(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return this.itemsService.findAll(user, paginationArgs, searchArgs);
  }

  @Query(() => Item, { name: 'item' })
  async findOne(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Item> {
    return this.itemsService.findOne(id, user);
  }

  @Mutation(() => Item)
  async updateItem(
    @CurrentUser() user: User,
    @Args('updateItemInput') updateItemInput: UpdateItemInput,
  ): Promise<Item> {
    return this.itemsService.update(updateItemInput.id, updateItemInput, user);
  }

  @Mutation(() => Item)
  async removeItem(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Item> {
    return this.itemsService.remove(id, user);
  }
}
