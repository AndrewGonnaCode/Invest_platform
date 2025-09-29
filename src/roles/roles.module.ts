import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { RolesService } from './roles.service';
// import { AdminGuard } from '../guards/admin.guard';
import { RolesController } from './roles.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User])],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
