import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @Expose()
  @ApiProperty({ example: 'c8a86d9b-fb5c-4cc4-b7a0-1a8b4bb3c212', description: 'UUID of the cart item' })
  id: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID who owns this cart' })
  userId: string;

  @Expose()
  @ApiProperty({ example: '789e4567-e89b-12d3-a456-426614174000', description: 'Product ID added to the cart' })
  productId: string;

  @Expose()
  @ApiProperty({ example: 2, description: 'Quantity of the product in the cart' })
  quantity: number;

  @Expose()
  @ApiProperty({ example: '2025-10-28T20:29:18.542Z', description: 'Creation timestamp (ISO string)' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-10-28T20:30:18.542Z', description: 'Last update timestamp (ISO string)' })
  updatedAt: Date;
}
