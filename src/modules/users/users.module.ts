import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { HashProvider } from '../../common/providers/hash.provider';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, HashProvider],
  controllers: [UsersController],
  exports: [UsersService, HashProvider],
})
export class UsersModule {}
