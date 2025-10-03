import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './entities/cat.entity'; // Corrected import path
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Cat> {
    return this.catsService.getOneCat(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatedCat: UpdateCatDto): Promise<Cat> {
    return this.catsService.updateCat(id, updatedCat);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.catsService.deleteCat(id);
  }
}
