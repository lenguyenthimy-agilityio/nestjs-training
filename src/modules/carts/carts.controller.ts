import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  Get,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { User } from '../users/entities/user.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CartItemResponseDto } from '../cart-items/dto/cart-item-response.dto';
import { PaginationMeta } from '../../common/interfaces/pagination-meta.interface';

@ApiTags('Carts')
@ApiBearerAuth() // Require JWT or token in Swagger UI
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // ─────────────────────────────────────────────
  // POST /carts/items
  // ─────────────────────────────────────────────
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({
    status: 201,
    description: 'Product successfully added to cart',
    type: CartItemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized – Missing or invalid token' })
  @SerializeOptions({ type: CartItemResponseDto })
  async addItem(@Req() req, @Body() dto: AddCartItemDto) {
    const user = req.user as User;
    return this.cartsService.addItem(user, dto);
  }

  // ─────────────────────────────────────────────
  // DELETE /carts/items/:cartItemId
  // ─────────────────────────────────────────────
  @Delete('items/:cartItemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a product from the cart' })
  @ApiParam({ name: 'cartItemId', type: String, description: 'Cart item UUID' })
  @ApiResponse({ status: 204, description: 'Item removed successfully (no content)' })
  @ApiResponse({ status: 401, description: 'Unauthorized – Missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden – Not your cart' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeItem(@Req() req, @Param('cartItemId') cartItemId: string): Promise<void> {
    const user = req.user as User;
    await this.cartsService.removeItem(user, cartItemId);
  }

  // ─────────────────────────────────────────────
  // GET /carts/items?limit=10&offset=0
  // ─────────────────────────────────────────────
  @Get('items')
  @ApiOperation({ summary: 'Get all items in the current user’s cart' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of cart items',
    schema: {
      example: {
        data: [
          {
            id: 'string',
            userId: 'string',
            productId: 'string',
            quantity: 2,
            createdAt: '2025-10-28T20:29:18.542Z',
            updatedAt: '2025-10-28T20:29:18.542Z',
          },
        ],
        pagination: {
          total: 1,
          limit: 10,
          offset: 0,
        },
      },
    },
  })
  async getCartItems(
    @Req() req,
    @Query() query: PaginationQueryDto,
  ): Promise<{
    data: CartItemResponseDto[];
    pagination: PaginationMeta;
  }> {
    const user = req.user as User;
    return this.cartsService.getCartItems(user, query);
  }
}
