import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CatsService } from './cats.service';
import type { Cat } from '../interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}
  @Post()
  create(@Body() cat: Cat) {
    this.catsService.create(cat);
  }

  @Get()
  findAll(): Cat[] {
    return this.catsService.findAll();
  }

  @Get(':name')
  getOneCat(@Param('name') name: string): Cat {
    return this.catsService.getOneCat(name);
  }

  @Put(':name')
  updateCat(@Param('name') name: string, @Body() updatedCat: Partial<Cat>): Cat {
    return this.catsService.updateCat(name, updatedCat);
  }

  @Delete(':name')
  deleteCat(@Param('name') name: string): void {
    return this.catsService.deleteCat(name);
  }
}
