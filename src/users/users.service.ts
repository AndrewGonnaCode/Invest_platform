import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  public async findByWallet(walletAddress: string) {
    return this.usersRepo.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
  }

  async findAll(): Promise<User[]> {
    console.log('findAll users');
    return this.usersRepo.find({
      relations: ['roles'], // если хочешь сразу подтягивать роли
      order: { createdAt: 'DESC' }, // сортировка по дате создания
    });
  }

  async upsertByWallet(walletAddress: string) {
    let user = await this.findByWallet(walletAddress);
    if (!user) {
      user = this.usersRepo.create({
        walletAddress: walletAddress.toLowerCase(),
      });
      user = await this.usersRepo.save(user);
    }
    return user;
  }

  async removeByWallet(walletAddress: string) {
    const user = await this.findByWallet(walletAddress);
    if (!user) {
      return null;
    }
    return this.usersRepo.remove(user);
  }
}
