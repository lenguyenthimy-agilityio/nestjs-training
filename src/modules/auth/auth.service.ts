import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Validate for LocalStrategy
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    // Don’t return password hash
    const { password: _, ...result } = user;

    this.logger.log(`User validated: ${email}`);

    return result as User;
  }

  async signUp(dto: SignupDto): Promise<{ access_token: string }> {
    const user = await this.usersService.create(dto);
    // Immediately generate a token for auto-login
    const { access_token } = await this.signIn(user);
    return { access_token: access_token };
  }

  async signIn(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
