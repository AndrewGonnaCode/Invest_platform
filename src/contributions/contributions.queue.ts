import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContributionsQueue {
  private queue: Queue;

  constructor(private readonly config: ConfigService) {
    this.queue = new Queue('contributions-queue', {
      connection: {
        host: this.config.get('REDIS_HOST'),
        port: this.config.get('REDIS_PORT'),
      },
    });
  }

  async addContributionJob(contributionId: number, dto: any) {
    await this.queue.add('process-contribution', {
      contributionId,
      ...dto,
    });
  }
}
