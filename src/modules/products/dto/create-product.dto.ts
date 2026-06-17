import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'wireless-mouse', maxLength: 180 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  slug: string;

  @ApiPropertyOptional({ example: 'Ergonomic 2.4GHz wireless mouse' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 29, minimum: 0 })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, minimum: 0 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: 'https://example.com/images/mouse.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 'category-uuid' })
  @IsUUID()
  categoryId: string;
}
