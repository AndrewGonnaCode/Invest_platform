import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../redis-cache/redis-cache.service';

@Injectable()
export class TrendingService {
  constructor(private readonly redis: RedisCacheService) {}

  async getTrending() {
    const cached = await this.redis.lrange('recent:campaigns', 0, 9);
    return cached.map((i) => JSON.parse(i));
  }
}
