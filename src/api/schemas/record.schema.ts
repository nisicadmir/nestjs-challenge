import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RecordFormat, RecordCategory } from './record.enum';

/**
 * As the challenge says we should have unique identifier by:
 * **artist**
 * **album**
 * **format**
 */

@Schema({ timestamps: true })
export class Record extends Document {
  @Prop({ required: true, index: true })
  artist: string;

  @Prop({ required: true, index: true })
  album: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  qty: number;

  @Prop({ enum: RecordFormat, required: true, index: true })
  format: RecordFormat;

  @Prop({ enum: RecordCategory, required: true, index: true })
  category: RecordCategory;

  @Prop({ default: Date.now })
  created: Date;

  @Prop({ default: Date.now })
  lastModified: Date;

  @Prop({ required: false })
  mbid?: string;
}

export const RecordSchema = SchemaFactory.createForClass(Record);

// Add regular indexes to support regex queries
RecordSchema.index({ artist: 1 });
RecordSchema.index({ album: 1 });
RecordSchema.index({ category: 1 });
// Adding unique index.
// Important to add this index.
// If this index cannot be added then we need to fix the data before adding the index.
RecordSchema.index({ album: 1, artist: 1, format: 1 }, { unique: true });

// Add compound indexes for common query combinations
RecordSchema.index({ artist: 1, album: 1 });
