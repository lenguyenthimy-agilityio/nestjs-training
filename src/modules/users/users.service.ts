import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { SignupDto } from '../auth/dto/signup.dto';
import { UpdateUserRoleDto } from '../users/dto/update-user-role.dto';
import { ERROR_MESSAGE } from '../../common/constants/error.constant';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject('HASH_PROVIDER')
    private readonly hashProvider: {
      hash(password: string): Promise<string>;
      compare(password: string, hashed: string): Promise<boolean>;
    },
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
      throw new ConflictException(ERROR_MESSAGE.USER_EXISTED);
    }

    const hashed = await this.hashProvider.hash(password);

    const user = this.usersRepository.create({
      email: email,
      password: hashed,
      role: Role.USER,
    });

    return this.usersRepository.save(user);
  }

  async updateRole(id: string, dto: UpdateUserRoleDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(ERROR_MESSAGE.USER_NOT_FOUND(id));

    user.role = dto.role;
    await this.usersRepository.save(user);

    return user;
  }
  // Return all users (for admin feature)
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
