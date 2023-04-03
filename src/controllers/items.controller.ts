import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { Item } from '../entities/item.entity';
import { ItemRepository } from '../repositories/item.repository';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemRepository: ItemRepository) {}

  @Get()
  async findAll(): Promise<Item[]> {
    return this.itemRepository.find();
  }

  @Post()
  async create(@Body() item: Item): Promise<Item> {
    return this.itemRepository.save(item);
  }

@Put(':id')
async update(@Param('id') id: number, @Body() item: Item): Promise<Item> {
await this.itemRepository.update(id, item);
return this.itemRepository.findOne(id);
}

@Delete(':id')
async delete(@Param('id') id: number): Promise<void> {
await this.itemRepository.delete(id);
}
}