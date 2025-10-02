import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contribution } from '../entities/contribution.entity';
import { Campaign } from '../entities/campaign.entity';
import { ContributionsService } from './contributions.service';
import { ContributionsController } from './contributions.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { UsersModule } from '../users/users.module';
import { ContributionsQueue } from './contributions.queue';
import { ContributionsWorker } from './contributions.worker';
import { KafkaModule } from 'src/kafka/kafka.module';
import { KafkaService } from 'src/kafka/kafka.service';
import { ContributionConsumer } from './contributions.consumer';
import { TelegramModule } from 'src/telegram/telegram.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Contribution, Campaign]),
    BlockchainModule,
    RedisCacheModule,
    UsersModule,
    // KafkaModule,
    TelegramModule,
  ],
  controllers: [ContributionsController],
  providers: [ContributionsService, ContributionsQueue, ContributionsWorker],
  exports: [ContributionsService, ContributionsQueue, ContributionsWorker],
})
export class ContributionsModule {}
