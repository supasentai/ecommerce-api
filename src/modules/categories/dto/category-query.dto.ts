import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const CATEGORY_SORT_FIELDS = ['createdAt', 'name'] as const;
const SORT_ORDERS = ['asc', 'desc'] as const;

export class CategoryQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'electronics' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: CATEGORY_SORT_FIELDS,
    default: 'createdAt',
    example: 'name',
  })
  @IsOptional()
  @IsIn(CATEGORY_SORT_FIELDS)
  sortBy?: (typeof CATEGORY_SORT_FIELDS)[number] = 'createdAt';

  @ApiPropertyOptional({ enum: SORT_ORDERS, default: 'desc', example: 'desc' })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  sortOrder?: (typeof SORT_ORDERS)[number] = 'desc';
}
