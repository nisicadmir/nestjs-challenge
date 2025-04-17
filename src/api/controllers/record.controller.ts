import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import {
  generateNextPageToken,
  generatePaginationQuery,
  getLimit,
  getSortOrder,
  parseNextPageToken,
} from '../lib/paginate';
import { SortOrder } from '../lib/paginate.model';
import {
  RecordCategory,
  RecordFormat,
  RecordSortBy,
} from '../schemas/record.enum';
import { Record } from '../schemas/record.schema';

import { RecordRepository } from '../repositories/record.repository';
@Controller('records')
export class RecordController {
  constructor(private readonly recordRepository: RecordRepository) {}

  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @ApiResponse({ status: 201, description: 'Record successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() request: CreateRecordRequestDTO): Promise<Record> {
    return await this.recordRepository.create({
      artist: request.artist,
      album: request.album,
      price: request.price,
      qty: request.qty,
      format: request.format,
      category: request.category,
      mbid: request.mbid,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing record' })
  @ApiResponse({ status: 200, description: 'Record updated successfully' })
  @ApiResponse({ status: 500, description: 'Cannot find record to update' })
  async update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordRequestDTO,
  ): Promise<Record> {
    const record = await this.recordRepository.findById(id);
    if (!record) {
      throw new InternalServerErrorException('Record not found');
    }

    Object.assign(record, updateRecordDto);

    const updated = await this.recordRepository.updateOne(id, record);
    if (!updated) {
      throw new InternalServerErrorException('Failed to update record');
    }

    return record;
  }

  @Get()
  @ApiOperation({ summary: 'Get all records with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of records',
    type: [Record],
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Search query (search across multiple fields like artist, album, category, etc.)',
    type: String,
  })
  @ApiQuery({
    name: 'artist',
    required: false,
    description: 'Filter by artist name',
    type: String,
  })
  @ApiQuery({
    name: 'album',
    required: false,
    description: 'Filter by album name',
    type: String,
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Filter by record format (Vinyl, CD, etc.)',
    enum: RecordFormat,
    type: String,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by record category (e.g., Rock, Jazz)',
    enum: RecordCategory,
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit the number of records returned',
    type: Number,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (asc or desc)',
    enum: SortOrder,
    type: String,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description:
      'Sort by values. Currently supporting createdAt and updatedAt fields',
    enum: RecordSortBy,
    type: String,
  })
  @ApiQuery({
    name: 'next',
    required: false,
    description: 'Next page token',
    type: String,
  })
  async findAll(
    @Query('q') q?: string,
    @Query('artist') artist?: string,
    @Query('album') album?: string,
    @Query('format') format?: RecordFormat,
    @Query('category') category?: RecordCategory,
    @Query('limit') limit?: number,
    @Query('sortOrder') sortOrder?: SortOrder,
    @Query('sortBy') sortBy?: RecordSortBy,
    @Query('next') next?: string,
  ): Promise<{ data: Record[]; nextPageToken: string }> {
    const filter: any = {};

    const limitValue = getLimit(limit);
    const sortOrderValue = getSortOrder(sortOrder);
    const nextValue = parseNextPageToken(next);
    const sortByValue = sortBy ? sortBy : RecordSortBy.CREATED_AT;

    /*
     * We will use a key-set pagination for this endpoint.
     * If we do not use pagination then if filters are not provided we might return all data from the database.
     */

    /*
     * IMPORTANT:
     * Using regex with includes cannot use any index of MongoDB.
     * Alternative will be to use `{ artist: { $regex: `^${q}`, $options: 'i' } }` // startsWith filter which uses index.
     * This query will end up with scanning all the documents and if we are having too many data inside
     * the DB then this query is not performant at all.
     *
     * MongoDB's full text search cannot handle cases where we need contains option.
     */
    if (q) {
      filter.$or = [
        { artist: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    if (artist) {
      filter.artist = { $regex: artist, $options: 'i' };
    }

    if (album) {
      filter.album = { $regex: album, $options: 'i' };
    }

    if (format) {
      filter.format = format;
    }

    if (category) {
      filter.category = category;
    }

    const finalFilter = generatePaginationQuery(
      filter,
      { sortBy: sortByValue, sortOrder: sortOrderValue },
      nextValue,
    );

    const data = await this.recordRepository.find(finalFilter, limitValue, {
      [sortByValue]: sortOrderValue,
      _id: sortOrderValue,
    });

    const nextPageToken = generateNextPageToken(
      data,
      {
        sortBy: sortByValue,
        sortOrder: sortOrderValue,
      },
      limitValue,
    );

    return { data, nextPageToken };
  }
}
