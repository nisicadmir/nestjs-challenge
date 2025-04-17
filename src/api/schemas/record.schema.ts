import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RecordFormat, RecordCategory } from './record.enum';
import { ITrack } from './track.model';

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

  @Prop({ required: false })
  tracks?: ITrack[];
}

export const RecordSchema = SchemaFactory.createForClass(Record);

// Adding unique index.
// If this index cannot be added then we need to fix the data before adding the index.
RecordSchema.index({ album: 1, artist: 1, format: 1 }, { unique: true });

// Add compound indexes for common query combinations
// Sort by createdAt field
RecordSchema.index({ artist: 1, album: 1, createdAt: 1, _id: 1 });
RecordSchema.index({ album: 1, artist: 1, createdAt: 1, _id: 1 });

// Sort by updatedAt field
RecordSchema.index({ artist: 1, album: 1, updatedAt: 1, _id: 1 });
RecordSchema.index({ album: 1, artist: 1, updatedAt: 1, _id: 1 });

// Format-based indexes with pagination support
RecordSchema.index({ format: 1, createdAt: 1, _id: 1 });
RecordSchema.index({ format: 1, updatedAt: 1, _id: 1 });

// Category-based indexes with pagination support
RecordSchema.index({ category: 1, createdAt: 1, _id: 1 });
RecordSchema.index({ category: 1, updatedAt: 1, _id: 1 });

// Combined format and category indexes with pagination support
RecordSchema.index({ format: 1, category: 1, createdAt: 1, _id: 1 });
RecordSchema.index({ format: 1, category: 1, updatedAt: 1, _id: 1 });

// Format with artist/album indexes
RecordSchema.index({ format: 1, artist: 1, createdAt: 1, _id: 1 });
RecordSchema.index({ format: 1, artist: 1, updatedAt: 1, _id: 1 });
RecordSchema.index({ format: 1, album: 1, createdAt: 1, _id: 1 });
RecordSchema.index({ format: 1, album: 1, updatedAt: 1, _id: 1 });

// Category with artist/album indexes
RecordSchema.index({ category: 1, artist: 1, createdAt: 1, _id: 1 });
RecordSchema.index({ category: 1, artist: 1, updatedAt: 1, _id: 1 });
RecordSchema.index({ category: 1, album: 1, createdAt: 1, _id: 1 });
RecordSchema.index({ category: 1, album: 1, updatedAt: 1, _id: 1 });
