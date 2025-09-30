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

  updateCat(name: string, updatedCat: Partial<Cat>): Cat {
    const catIndex = this.cats.findIndex((cat) => cat.name === name);
    if (catIndex === -1) {
      throw new Error(`Cat with name "${name}" not found`);
    }
    this.cats[catIndex] = { ...this.cats[catIndex], ...updatedCat };
    return this.cats[catIndex];
  }

  deleteCat(name: string): void {
    const catIndex = this.cats.findIndex((cat) => cat.name === name);
    if (catIndex === -1) {
      throw new Error(`Cat with name "${name}" not found`);
    }
    this.cats.splice(catIndex, 1);
  }
}
