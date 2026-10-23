import { IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';

export class UpdateUserRoleDto {
  @IsEnum(Role, { message: "Role must be either 'admin' or 'user'" })
  role: Role;
}
