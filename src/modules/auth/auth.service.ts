import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  validateUser(username: string, password: string): boolean {
    // Dummy validation logic
    return username === 'admin' && password === 'password';
  }
}
