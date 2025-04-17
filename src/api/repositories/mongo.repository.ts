import { InternalServerErrorException } from '@nestjs/common';
import { Model, Document, ClientSession } from 'mongoose';

export abstract class MongoRepository<T extends Document> {
  constructor(private readonly model: Model<T>) {}

  async startSession(): Promise<ClientSession> {
    return await this.model.startSession();
  }

  async find(filter: any = {}, limit?: number, sort?: any): Promise<T[]> {
    const query = this.model.find(filter);

    if (limit) {
      query.limit(limit);
    }

    if (sort) {
      query.sort(sort);
    }

    const data = await query.exec();
    return data;
  }

  async findById(id: string): Promise<T> {
    try {
      return this.model.findById(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to find record', error);
    }
  }

  async create(data: any): Promise<T> {
    try {
      return this.model.create(data);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create record', error);
    }
  }

  async createMany(data: any[], options?: any): Promise<T[]> {
    try {
      return this.model.create(data, options);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create records', error);
    }
  }

  async updateOne(filter: any, update: any, options?: any) {
    try {
      return this.model.updateOne(filter, update, options);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update record', error);
    }
  }
}
