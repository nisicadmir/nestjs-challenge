import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from '../schemas/record.schema';
import { MongoRepository } from './mongo.repository';

@Injectable()
export class RecordRepository extends MongoRepository<Record> {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
  ) {
    super(recordModel);
  }
}
