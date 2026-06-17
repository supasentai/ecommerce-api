import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'product-uuid' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  quantity: number;
}
