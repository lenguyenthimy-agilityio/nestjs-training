import { Expose } from 'class-transformer';

export class CartItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  productId: string;

  @Expose()
  quantity: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
