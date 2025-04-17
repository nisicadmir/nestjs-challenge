import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordController } from './controllers/record.controller';
import { RecordRepository } from './repositories/record.repository';
import { RecordSchema } from './schemas/record.schema';
import { RecordService } from './services/record.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Record', schema: RecordSchema }]),
  ],
  controllers: [RecordController],
  providers: [RecordService, RecordRepository],
})
export class RecordModule {}
