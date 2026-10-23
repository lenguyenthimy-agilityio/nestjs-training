import { Controller, Post, Body, HttpCode, HttpStatus, Get, Delete, Query, Patch, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiCreatedResponse,
  ApiQuery,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../users/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { GetProductsDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ParseUUIDCustomPipe } from '../../common/pipes/parse-uuid-custom.pipe';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --------------------------
  // CREATE PRODUCT
  // --------------------------
  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiBody({ type: CreateProductDto, description: 'Product creation payload' })
  @ApiCreatedResponse({
    description: 'Product successfully created.',
    type: CreateProductDto,
  })
  @ApiForbiddenResponse({
    description: 'Only Admin users are allowed to create products.',
  })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // --------------------------
  // GET ALL PRODUCTS
  // --------------------------
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a paginated list of all products (Admin only)' })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Search by product name (partial match)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of results to return (default: 10)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset for pagination (default: 0)',
  })
  @ApiOkResponse({
    description: 'List of products returned successfully.',
    type: [CreateProductDto],
  })
  @ApiForbiddenResponse({ description: 'Only Admin users can list products.' })
  findAll(@Query() query: GetProductsDto) {
    return this.productsService.findAll(query);
  }

  // --------------------------
  // GET ONE PRODUCT
  // --------------------------
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get product details by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The unique identifier of the product',
  })
  @ApiOkResponse({
    description: 'Product details fetched successfully.',
    type: Product,
  })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  @ApiForbiddenResponse({ description: 'Only Admin users can view product details.' })
  async findOne(@Param('id', ParseUUIDCustomPipe) id: string) {
    return this.productsService.findOne(id);
  }

  // --------------------------
  // UPDATE PRODUCT
  // --------------------------
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update product details (Admin only)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The unique identifier of the product to update',
  })
  @ApiBody({ type: UpdateProductDto, description: 'Product update payload' })
  @ApiOkResponse({
    description: 'Product successfully updated.',
    type: Product,
  })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  @ApiForbiddenResponse({ description: 'Only Admin users can update products.' })
  async update(@Param('id', ParseUUIDCustomPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  // --------------------------
  // DELETE PRODUCT
  // --------------------------
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The unique identifier of the product to delete',
  })
  @ApiNoContentResponse({ description: 'Product successfully deleted.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  @ApiForbiddenResponse({ description: 'Only Admin users can delete products.' })
  async delete(@Param('id', ParseUUIDCustomPipe) id: string) {
    await this.productsService.delete(id);
  }
}
