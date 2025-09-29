import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { VerifyDto } from './dto/verify.dto';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly redis: RedisCacheService,
    private readonly jwtService: JwtService,
  ) {}

  async generateNonce() {
    const nonce = randomBytes(16).toString('hex');
    await this.redis.set(`auth:nonce:${nonce}`, '1', 300);
    return { nonce };
  }

  async verifySignature(dto: VerifyDto) {
    const { walletAddress, signature, nonce } = dto;
    // const exists = await this.redis.get(`auth:nonce:${nonce}`);
    // if (!exists) {
    //   throw new Error('Invalid or expired nonce');
    // }
    // const message = `Sign-In with Ethereum:\n${walletAddress}\n\nNonce: ${nonce}`;
    // const recovered = verifyMessage(message, signature);
    // if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
    //   throw new Error('Signature verification failed');
    // }
    let user = await this.usersRepo.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
      relations: ['roles'],
    });
    if (!user) {
      user = this.usersRepo.create({
        walletAddress: walletAddress.toLowerCase(),
      });
      await this.usersRepo.save(user);
    }
    await this.redis.delete(`auth:nonce:${nonce}`);
    const sessionKey = `session:${walletAddress.toLowerCase()}`;
    await this.redis.set(
      sessionKey,
      JSON.stringify({ userId: user.id, walletAddress: user.walletAddress }),
      60 * 60 * 24 * 7,
    );
    return this.generateToken(user);
  }

  private async generateToken(user: User) {
    const payload = { walletAddress: user.walletAddress, id: user.id, roles: user.roles };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
