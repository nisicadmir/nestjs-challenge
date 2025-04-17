import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { OrderRepository } from '../repositories/order.repository';
import { RecordRepository } from '../repositories/record.repository';
import { Order } from '../schemas/order.schema';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly recordRepository: RecordRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  async create(@Body() request: CreateOrderRequestDTO): Promise<Order> {
    // Find the record to get its price
    const record = await this.recordRepository.findById(request.recordId);
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    if (record.qty < request.quantity) {
      throw new BadRequestException('Not enough records in stock');
    }

    // Calculate total price
    const totalPrice = record.price * request.quantity;

    const session = await this.orderRepository.startSession();
    session.startTransaction();

    try {
      // Create the order
      const order = await this.orderRepository.createMany(
        [
          {
            recordId: request.recordId,
            quantity: request.quantity,
            totalPrice: totalPrice,
          },
        ],
        { session },
      );

      await this.recordRepository.updateOne(
        { _id: request.recordId },
        { $inc: { qty: -request.quantity } },
        { session },
      );

      await session.commitTransaction();
      await session.endSession();
      return order[0];
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new InternalServerErrorException('Failed to create order', error);
    }
  }
}
