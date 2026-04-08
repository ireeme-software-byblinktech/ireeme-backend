import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SellStockDto {
  @ApiProperty({ description: 'Stock item ID' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ description: 'Quantity to sell', minimum: 1 })
  @IsInt()
  @Min(1)
  qty: number;
}
