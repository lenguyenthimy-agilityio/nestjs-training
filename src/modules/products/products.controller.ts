import { Controller, Post, Body, HttpCode, HttpStatus, Get, Delete, Query, Patch, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiBearerAuth, ApiTags, ApiCreatedResponse, ApiQuery, ApiNoContentResponse } from '@nestjs/swagger';
import { Roles } from '../users/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { GetProductsDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Product successfully created.' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Search by product name' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  findAll(@Query() query: GetProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiQuery({ name: 'id', required: true, type: String, description: 'Product ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiQuery({ name: 'id', required: true, type: String, description: 'Product ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Product successfully deleted.' })
  async delete(@Param('id') id: string) {
    await this.productsService.delete(id);
  }
}
