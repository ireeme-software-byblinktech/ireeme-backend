import { IsOptional, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryPermissionsDto {
  @ApiProperty({ required: false, enum: PermissionStatus })
  @IsOptional()
  @IsEnum(PermissionStatus)
  status?: PermissionStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
