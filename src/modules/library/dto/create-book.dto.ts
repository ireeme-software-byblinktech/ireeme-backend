import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'Things Fall Apart' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Chinua Achebe' })
  @IsString()
  author: string;

  @ApiProperty({ required: false, example: '978-0-385-47454-2' })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiProperty({ required: false, example: 'Fiction' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiProperty({ example: 5, description: 'Total copies in library' })
  @IsInt()
  @Min(1)
  totalCopies: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverUrl?: string;
}
