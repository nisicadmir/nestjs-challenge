import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoRepository } from './mongo.repository';
import { Order } from '../schemas/order.schema';

@Injectable()
export class OrderRepository extends MongoRepository<Order> {
  constructor(@InjectModel('Order') private readonly orderModel: Model<Order>) {
    super(orderModel);
  }
}
