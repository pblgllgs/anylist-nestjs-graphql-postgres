import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput, UpdateListItemInput } from './dto/inputs';
import { InjectRepository } from '@nestjs/typeorm';
import { ListItem } from './entities/list-item.entity';
import { Repository } from 'typeorm';
import { List } from '../list/entities/list.entity';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { SearchArgs } from '../common/dto/args/search.args';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
  ) {}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = createListItemInput;
    const newListItem = this.listItemRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId },
    });

    return this.listItemRepository.save(newListItem);
  }

  async findAll(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemRepository
      .createQueryBuilder('listItem')
      .innerJoin('listItem.item', 'item')
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      queryBuilder.andWhere('LOWER(item.name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }
    return queryBuilder.getMany();
  }

  async countListItemsByList(list: List) {
    return this.listItemRepository.count({
      where: {
        list: { id: list.id },
      },
    });
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemRepository.findOneBy({ id });
    if (!listItem) {
      throw new NotFoundException(`The id ${id} not found`);
    }
    return listItem;
  }

  async update(
    id: string,
    updateListItemInput: UpdateListItemInput,
  ): Promise<ListItem> {
    console.log({ updateListItemInput });
    const { listId, itemId, ...rest } = updateListItemInput;

    const queryBuilder = this.listItemRepository
      .createQueryBuilder()
      .update()
      .set({
        ...rest,
        ...(listId && { list: { id: listId } }),
        ...(itemId && { item: { id: itemId } }),
      })
      .where('id = :id', { id });

    await queryBuilder.execute();
    return this.findOne(id);
  }

  // remove(id: number) {
  //   return `This action removes a #${id} listItem`;
  // }
}
