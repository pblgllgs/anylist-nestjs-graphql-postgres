import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    try {
      const newItem = this.itemsRepository.create({ ...createItemInput, user });
      return await this.itemsRepository.save(newItem);
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(user: User): Promise<Item[]> {
    //TODO: filtrar, paginar, por usuario
    const items = await this.itemsRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });
    return items;
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });
    if (!item) throw new NotFoundException(`No se encontró id: ${id}`);
    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);
    //? const item = await this.itemsRepository.preload({...updateItemInput,user});
    const item = await this.itemsRepository.preload(updateItemInput);
    if (!item) throw new NotFoundException(`No se encontró id: ${id}`);
    return this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    //TODO: soft delete, integridad referencial
    const item = await this.findOne(id, user);
    if (!item) throw new NotFoundException(`No se encontró id: ${id}`);
    await this.itemsRepository.remove(item);
    return { ...item, id };
  }

  async itemCountByUser(user: User): Promise<number> {
    return await this.itemsRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}
