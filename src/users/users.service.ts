import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOneById(id: number): Promise<User> {
    const foundUser = await this.usersRepository.findOne({ where: { id } });
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }
    return foundUser;
  }

  async findOneByUsername(username: string): Promise<User> {
    const foundUser = await this.usersRepository.findOne({ where: { username } });
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }
    return foundUser;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, role } = createUserDto;

    // 🔐 1. Generate salt & hash password
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hashSync(password, saltOrRounds);

    // 🔐 2. Store hashed password & salt in DB
    const newUser = this.usersRepository.create({
      username,
      // email,
      password: hashedPassword, // Store hashedPassword instead of plain password
      role,
    });
    return this.usersRepository.save(newUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
