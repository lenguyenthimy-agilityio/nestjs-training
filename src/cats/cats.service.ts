import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './entities/cat.entity'; // Update this import to your Cat entity
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
  ) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const newCat = this.catRepository.create(createCatDto);
    return this.catRepository.save(newCat);
  }

  async findAll(): Promise<Cat[]> {
    return this.catRepository.find();
  }

  async getOneCat(id: number): Promise<Cat> {
    const foundCat = await this.catRepository.findOne({ where: { id } });
    if (!foundCat) {
      throw new NotFoundException(`Cat with id "${id}" not found`);
    }
    return foundCat;
  }

  async updateCat(id: number, updatedCat: UpdateCatDto): Promise<Cat> {
    const cat = await this.getOneCat(id);
    Object.assign(cat, updatedCat);
    return this.catRepository.save(cat);
  }

  async deleteCat(id: number): Promise<void> {
    const cat = await this.getOneCat(id);
    await this.catRepository.remove(cat);
  }
}
