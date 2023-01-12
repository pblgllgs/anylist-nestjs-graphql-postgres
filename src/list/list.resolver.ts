import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ListService } from './list.service';
import { List } from './entities/list.entity';
import { CreateListInput, UpdateListInput } from './dto/inputs';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { PaginationArgs, SearchArgs } from '../common/dto/args';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ListItem } from '../list-item/entities/list-item.entity';
import { ListItemService } from '../list-item/list-item.service';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListResolver {
  constructor(
    private readonly listItemsService: ListItemService,
    private readonly listService: ListService,
  ) {}

  @Mutation(() => List)
  async createList(
    @CurrentUser() user: User,
    @Args('createListInput') createListInput: CreateListInput,
  ): Promise<List> {
    return this.listService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  async findAll(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {
    return this.listService.findAll(user, paginationArgs, searchArgs);
  }

  @Query(() => List, { name: 'list' })
  async findOne(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<List> {
    return this.listService.findOne(id, user);
  }

  @Mutation(() => List)
  async updateList(
    @CurrentUser() user: User,
    @Args('updateListInput') updateListInput: UpdateListInput,
  ): Promise<List> {
    return this.listService.update(updateListInput.id, updateListInput, user);
  }

  @Mutation(() => List)
  async removeList(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<List> {
    return this.listService.remove(id, user);
  }

  @ResolveField(() => [ListItem], { name: 'items' })
  async getListItems(
    @Parent() list: List,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    return this.listItemsService.findAll(list, paginationArgs, searchArgs);
  }

  @ResolveField(() => Number, { name: 'totalItems' })
  async countListItemsByList(@Parent() list: List): Promise<number> {
    return this.listItemsService.countListItemsByList(list);
  }
}
