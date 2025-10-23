import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { SignupDto } from '../auth/dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Create a new user with hashed password
  async create(dto: SignupDto): Promise<User> {
    const { email, password } = dto;
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      email: email,
      password: hashed,
      role: Role.USER,
    });

    return this.usersRepository.save(user);
  }

  // Return all users (for admin feature)
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
