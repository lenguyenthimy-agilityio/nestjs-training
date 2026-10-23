import { Controller, Patch, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Roles } from '../users/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    const updatedUser = await this.usersService.updateRole(id, dto);
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
