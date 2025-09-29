import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleName } from '../entities/role.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.createDefaultRoles();
  }

  private async createDefaultRoles() {
    const adminRole = await this.rolesRepo.findOne({ 
      where: { name: RoleName.ADMIN } 
    });
    
    if (!adminRole) {
      await this.rolesRepo.save({
        name: RoleName.ADMIN,
        description: 'Administrator with full access',
        permissions: ['create_campaign', 'manage_users', 'moderate_content', 'view_analytics'],
      });
    }

    const userRole = await this.rolesRepo.findOne({ 
      where: { name: RoleName.USER } 
    });
    
    if (!userRole) {
      await this.rolesRepo.save({
        name: RoleName.USER,
        description: 'Regular user with basic permissions',
        permissions: ['contribute', 'view_campaigns'],
      });
    }
  }

  async getAllRoles() {
    return this.rolesRepo.find();
  }

  async addRoleToUser(walletAddress: string, roleName: RoleName) {
    const user = await this.usersRepo.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');

    let role = await this.rolesRepo.findOne({ where: { name: roleName } });
    if (!role) {
      // можно авто-создавать роль, если не существует
      role = this.rolesRepo.create({ name: roleName });
      await this.rolesRepo.save(role);
    }

    if (!user.roles.some((r) => r.name === role.name)) {
      user.roles.push(role);
      await this.usersRepo.save(user);
    }

    return user;
  }

  async removeRoleFromUser(walletAddress: string, roleName: string) {
    const user = await this.usersRepo.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');

    user.roles = user.roles.filter((r) => r.name !== roleName);
    await this.usersRepo.save(user);

    return user;
  }

  async getUserRoles(walletAddress: string) {
    const user = await this.usersRepo.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user.roles;
  }

  async hasRole(walletAddress: string, roleName: string): Promise<boolean> {
    const user = await this.usersRepo.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');

    return user.roles.some((r) => r.name === roleName);
  }
}
