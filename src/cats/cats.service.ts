import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Cat } from './entities/cat.entity';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  // CREATE
  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const newCat = this.catRepository.create(createCatDto);
    const savedCat = await this.catRepository.save(newCat);

    // Clear or update cached list after mutation
    await this.cacheManager.del('cats:all');

    return savedCat;
  }

  // GET ALL (with cache)
  async findAll(): Promise<Cat[]> {
    const cacheKey = 'cats:all';

    const cachedCats = await this.cacheManager.get<Cat[]>(cacheKey);
    const start = Date.now();
    if (cachedCats) {
      console.log('⏱ Time:', Date.now() - start, 'ms');
      console.log('Returning from Redis cache');
      return cachedCats;
    }

    console.log('Fetching from database...');
    const cats = await this.catRepository.find();

    // Cache for 30 seconds (custom TTL)
    await this.cacheManager.set(cacheKey, cats, 30_000);
    console.log('⏱ Time:', Date.now() - start, 'ms');

    return cats;
  }

  // GET ONE (with cache)
  async getOneCat(id: number): Promise<Cat> {
    const cacheKey = `cats:${id}`;

    const cachedCat = await this.cacheManager.get<Cat>(cacheKey);
    if (cachedCat) {
      console.log(`Cat ${id} from cache`);
      return cachedCat;
    }

    const foundCat = await this.catRepository.findOne({ where: { id } });
    if (!foundCat) {
      throw new NotFoundException(`Cat with id "${id}" not found`);
    }

    await this.cacheManager.set(cacheKey, foundCat, 30_000);
    return foundCat;
  }

  // UPDATE
  async updateCat(id: number, updatedCat: UpdateCatDto): Promise<Cat> {
    const cat = await this.getOneCat(id);
    Object.assign(cat, updatedCat);
    const savedCat = await this.catRepository.save(cat);

    // Update cache for this cat and reset list
    await this.cacheManager.set(`cats:${id}`, savedCat, 30_000);
    await this.cacheManager.del('cats:all');

    return savedCat;
  }

  // DELETE
  async deleteCat(id: number): Promise<void> {
    const cat = await this.getOneCat(id);
    await this.catRepository.remove(cat);

    // Remove from cache
    await this.cacheManager.del(`cats:${id}`);
    await this.cacheManager.del('cats:all');
  }
}
