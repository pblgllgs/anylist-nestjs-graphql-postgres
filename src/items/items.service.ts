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
    // item.user = user;
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    const item = await this.itemsRepository.preload(updateItemInput);
    if (!item) throw new NotFoundException(`No se encontró id: ${id}`);
    return this.itemsRepository.save(item);
    // const item = await this.findOne(id);
    // if (!item) throw new NotFoundException(`No se encontró id: ${id}`);
    // const updateItem = {
    //   ...item,
    //   ...updateItemInput,
    // };
    // await this.itemsRepository.update(id, updateItem);
    // return updateItem;
  }

  async remove(id: string, user: User): Promise<Item> {
    //TODO: soft delete, integridad referencial
    const item = await this.findOne(id, user);
    if (!item) throw new NotFoundException(`No se encontró id: ${id}`);
    await this.itemsRepository.remove(item);
    return { ...item, id };
  }
}
