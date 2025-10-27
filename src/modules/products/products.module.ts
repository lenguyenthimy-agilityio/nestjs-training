import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { AuthModule } from '../auth/auth.module'; // ✅ Needed for JwtAuthGuard & RolesGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    AuthModule, // import to use guards and get user info
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // optional, if used elsewhere
})
export class ProductsModule {}
