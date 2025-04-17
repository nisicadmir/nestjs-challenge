import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './controllers/order.controller';
import { OrderRepository } from './repositories/order.repository';
import { OrderSchema } from './schemas/order.schema';
import { RecordSchema } from './schemas/record.schema';
import { RecordRepository } from './repositories/record.repository';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Record', schema: RecordSchema }]),
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
  ],
  controllers: [OrderController],
  providers: [OrderRepository, RecordRepository],
})
export class OrderModule {}
