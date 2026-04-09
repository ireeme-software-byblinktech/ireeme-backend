import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SellStockDto {
  @ApiProperty({
    description: 'Stock item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  itemId: string;

  @ApiProperty({
    description: 'Student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  studentId: string;

  @ApiProperty({
    description: 'Quantity to sell',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  qty: number;
}
