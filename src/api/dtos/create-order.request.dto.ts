import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderRequestDTO {
  @ApiProperty({ description: 'ID of the record being ordered' })
  @IsString()
  recordId: string;

  @ApiProperty({ description: 'Quantity of records to order' })
  @IsNumber()
  quantity: number;
}
