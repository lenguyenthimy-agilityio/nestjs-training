import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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
}
