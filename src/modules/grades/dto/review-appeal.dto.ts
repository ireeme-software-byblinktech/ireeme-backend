import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppealStatus } from '@prisma/client';

// Appeal statuses that can be set by a reviewer any one which is not among of this does not exist for appeals
const REVIEWABLE_STATUSES = [
  AppealStatus.REVIEWING,
  AppealStatus.APPROVED,
  AppealStatus.REJECTED
] as const;
export type ReviewableStatus = typeof REVIEWABLE_STATUSES[number]



export class ReviewAppealDto {
  @ApiProperty({
    description: 'Appeal status',
    enum: [AppealStatus.REVIEWING, AppealStatus.APPROVED, AppealStatus.REJECTED],
    example: AppealStatus.APPROVED,
  })
  @IsEnum([AppealStatus.REVIEWING, AppealStatus.APPROVED, AppealStatus.REJECTED])
  status: ReviewableStatus;

  @ApiPropertyOptional({
    description: 'Optional comment from reviewer',
    example: 'After review, the grade has been adjusted',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
