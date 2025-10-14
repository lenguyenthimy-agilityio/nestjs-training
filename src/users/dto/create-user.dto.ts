import { IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}
