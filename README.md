# NestJS Tutorial on CRUD API

Let's write a nestjs application for CRUD api support. Use typeorm, entity, model and repository patterns. Use postgreSQL for prod environment and SQLite for local dev. Use multi-stage docker file for base, install, run. Use docker-compose for complete deployment.

A basic implementation of a NestJS application that supports CRUD API operations using TypeORM and the repository pattern, and also includes multi-stage Dockerfile and Docker Compose configurations for local and production environments respectively. Here are the steps you can follow:

### Prerequisites
Node.js installed on your system
Docker installed on your system

## Step 1: Create a new NestJS application
You can create a new NestJS application using the Nest CLI tool. Open a terminal and run the following command:

```bash
npm i -g @nestjs/cli
nest new nestjs-crud-api
```

This will create a new NestJS application named nestjs-crud-api in a directory with the same name.

## Step 2: Install Required Packages
Navigate to the project directory and install the following packages:

```bash
npm install --save @nestjs/typeorm typeorm pg sqlite3
```

The @nestjs/typeorm package provides integration between NestJS and TypeORM, while the typeorm package is the TypeORM library itself. We are also installing the pg package for connecting to PostgreSQL in production and the sqlite3 package for connecting to SQLite in development.

## Step 3: Set up the TypeORM Configurations
Create a new ormconfig.json file in the root directory of your project with the following contents:
```javascript
{
  "type": "sqlite",
  "database": "database.sqlite",
  "entities": ["dist/**/*.entity{.ts,.js}"],
  "synchronize": true
}
```

This configuration file specifies that we are using SQLite for the database and that the entities property specifies the location of our TypeORM entities. The synchronize property is set to true to ensure that the database schema is automatically synchronized with the entities on startup.

In production, we will override this configuration with environment variables. We will specify these environment variables in a .env file that we will create later.

## Step 4: Create the TypeORM Entities
Create a new src/entities directory and create a new file named item.entity.ts in this directory with the following contents:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  quantity: number;
}

```

This entity represents a basic item with a name, description, and quantity.

## Step 5: Create the TypeORM Repository
Create a new src/repositories directory and create a new file named item.repository.ts in this directory with the following contents:

```typescript
import { EntityRepository, Repository } from 'typeorm';
import { Item } from '../entities/item.entity';

@EntityRepository(Item)
export class ItemRepository extends Repository<Item> {}

```

This repository will be used to perform CRUD operations on our Item entity.

## Step 6: Create the CRUD API
Create a new src/controllers directory and create a new file named items.controller.ts in this directory with the following contents:

```typescript
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

```

This controller defines the CRUD operations for our `Item` entity. We inject the `ItemRepository` into the constructor using dependency injection, and then define the various API routes using decorators. The methods use the repository to perform the corresponding CRUD operation.


### Step 7: Update the App Module

Open the `app.module.ts` file in the `src` directory and update it to include the following:

```typescript
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
```

This file imports the TypeOrmModule and sets up the configuration for the TypeORM integration. It also imports the ItemsController and registers it as a controller. Finally, it uses TypeOrmModule.forFeature to register the ItemRepository as a repository that can be injected elsewhere in our application.

Step 8: Create a Dockerfile
Create a new file named Dockerfile in the root directory of your project with the following contents:

```docker
# Base image
FROM node:14-alpine AS base

# Set the working directory
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install development dependencies
RUN apk add --no-cache --virtual .build-deps gcc musl-dev
RUN npm ci --only=development

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Install production dependencies without devDependencies
RUN npm prune --production

# Install the production runtime
FROM node:14-alpine
WORKDIR /app
COPY --from=base /app .
CMD ["npm", "start"]

```

This Dockerfile defines a multi-stage build for our application. It first creates a base image that installs the production dependencies and then a separate image that installs the development dependencies and builds the application. Finally, it creates a production image that only includes the necessary files to run the application.

## Step 9: Create a Docker Compose File
Create a new file named docker-compose.yml in the root directory of your project with the following contents:

```yml
version: '3.9'

services:
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_DB: nestjs_crud_api
    volumes:
      - ./data:/var/lib/postgresql/data
  app:
    build:
      context: .
    environment:
      DATABASE_URL: postgres://postgres:mysecretpassword@db/nestjs_crud_api
    ports:
      - '3000:3000'
    depends_on:
      - db

```

This Docker Compose file defines two services: a PostgreSQL database service and a service for our NestJS application. The db service uses the official postgres image and sets some environment variables and a volume for persistent data. The app service uses the Dockerfile we created earlier to build the application and run it. It also sets an environment variable for the database URL and maps the container port to the host port.

## Step 10: Test the Application
To test the application, run the following command in the root directory of your project:

```bash
docker-compose up
```

This will start the two services defined in the Docker Compose file: the PostgreSQL database and the NestJS application. You should see output in the console indicating that the services are starting up.

Once the services are running, you can test the API by sending HTTP requests to http://localhost:3000/items. For example, you can use a tool like curl to create a new item:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"name":"Test Item","description":"This is a test item."}' http://localhost:3000/items

```

You should receive a response with the details of the new item, including its ID.

You can then retrieve the item by sending a GET request to http://localhost:3000/items/:id, where :id is the ID of the item you just created. Similarly, you can update the item with a PUT request to the same URL, and delete it with a DELETE request.

## Conclusion
In this tutorial, we've walked through the process of creating a basic NestJS application with CRUD API support using the TypeORM, entity, model, and repository patterns. We've also shown how to use Docker and Docker Compose to package and deploy the application. With these tools and techniques, you can easily create robust and scalable APIs using NestJS.