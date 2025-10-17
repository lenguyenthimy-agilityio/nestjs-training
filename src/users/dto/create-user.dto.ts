import { IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Role } from '../enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe', description: 'The username of the user' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'strongPassword123', description: 'The password of the user' })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'USER', description: 'The role of the user', enum: Role })
  @IsEnum(Role)
  role: Role;
}
