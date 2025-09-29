import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('all')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':wallet')
  async getUser(@Param('wallet') wallet: string) {
    return this.usersService.findByWallet(wallet);
  }

  @Delete(':wallet')
  async removeUser(@Param('wallet') wallet: string) {
    return this.usersService.removeByWallet(wallet);
  }
}
