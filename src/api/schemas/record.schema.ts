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

// Create text index for full text search
RecordSchema.index(
  { artist: 'text', album: 'text', category: 'text' },
  {
    name: 'record_text_search',
    weights: {
      artist: 3, // artist matches are more important
      album: 2, // album matches are second most important
      category: 1, // category matches are least important
    },
  },
);
