import { Controller, Param, Post, Delete, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { RoleName } from 'src/entities/role.entity';

@ApiTags('roles')
@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ✅ Получить все роли в системе
  @Get('roles/all')
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  // ✅ Работа с ролями конкретного пользователя
  @Post('users/:walletAddress/roles/:roleName')
  async addRole(
    @Param('walletAddress') walletAddress: string,
    @Param('roleName') roleName: RoleName,
  ) {
    return this.rolesService.addRoleToUser(walletAddress, roleName);
  }

  @Delete('users/:walletAddress/roles/:roleName')
  async removeRole(
    @Param('walletAddress') walletAddress: string,
    @Param('roleName') roleName: RoleName,
  ) {
    return this.rolesService.removeRoleFromUser(walletAddress, roleName);
  }

  @Get('users/:walletAddress/roles')
  async getUserRoles(@Param('walletAddress') walletAddress: string) {
    return this.rolesService.getUserRoles(walletAddress);
  }

  @Get('users/:walletAddress/roles/check/:roleName')
  async hasRole(
    @Param('walletAddress') walletAddress: string,
    @Param('roleName') roleName: string,
  ) {
    return this.rolesService.hasRole(walletAddress, roleName);
  }
}
