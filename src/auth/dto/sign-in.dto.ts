//sign in dto apply class-validator
import { IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
