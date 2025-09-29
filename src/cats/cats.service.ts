import { Injectable } from '@nestjs/common';
import { Cat } from '../interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];
  create(cat: Cat) {
    this.cats.push(cat);
  }
  findAll(): Cat[] {
    return this.cats;
  }

  getOneCat(name: string): Cat {
    const foundCat = this.cats.find((cat) => cat.name === name);
    if (!foundCat) {
      throw new Error(`Cat with name "${name}" not found`);
    }
    return foundCat;
  }
}
