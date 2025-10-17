import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './entities/cat.entity'; // Corrected import path
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Roles } from '../users/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { ApiTags, ApiHeader, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';

@ApiTags('Cats')
@ApiHeader({
  name: 'X-MyHeader',
  description: 'Custom header',
})
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: Cat,
  })
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }

  @ApiResponse({ status: 200, description: 'List of cats', type: [Cat] })
  @Get()
  @Roles(Role.ADMIN) // Example of role-based access control
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @ApiResponse({ status: 200, description: 'A single cat', type: Cat })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Cat> {
    return this.catsService.getOneCat(id);
  }

  @ApiResponse({ status: 200, description: 'The record has been successfully updated.', type: Cat })
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatedCat: UpdateCatDto): Promise<Cat> {
    return this.catsService.updateCat(id, updatedCat);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.catsService.deleteCat(id);
  }
}
