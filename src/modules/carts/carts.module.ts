import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product]), // <-- Product must be here
  ],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
