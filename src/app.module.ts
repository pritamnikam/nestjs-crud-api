import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { ItemsController } from './controllers/items.controller';
import { ItemRepository } from './repositories/item.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_URL || 'database.sqlite',
      entities: [Item],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ItemRepository]),
  ],
  controllers: [ItemsController],
})
export class AppModule {}