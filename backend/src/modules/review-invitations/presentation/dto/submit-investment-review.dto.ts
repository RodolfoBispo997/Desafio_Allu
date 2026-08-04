import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SubmitInvestmentReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(5)
  overallExperienceRating!: number;
  @ApiProperty({ minimum: 1, maximum: 5 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(5)
  informationClarityRating!: number;
  @ApiProperty({ minimum: 1, maximum: 5 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(5)
  processEaseRating!: number;
  @ApiProperty({ minLength: 10, maxLength: 2000 })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  comment!: string;
  @ApiProperty({ example: true })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  policyAccepted!: boolean;
}
