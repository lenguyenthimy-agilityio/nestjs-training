import { Controller, Post, Body, Req, HttpCode, HttpStatus, Delete, Param, Get, Query } from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { User } from '../users/entities/user.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async addItem(@Req() req, @Body() dto: AddCartItemDto) {
    const user = req.user as User;
    const item = await this.cartsService.addItem(user, dto);
    return item;
  }

  @Delete('items/:cartItemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Req() req, @Param('cartItemId') cartItemId: string): Promise<void> {
    const user = req.user as User;
    await this.cartsService.removeItem(user, cartItemId);
  }

  // GET /carts/items?limit=10&offset=0
  @Get('items')
  async getCartItems(@Req() req, @Query() query: PaginationQueryDto) {
    const user = req.user as User;
    return this.cartsService.getCartItems(user, query);
  }
}
