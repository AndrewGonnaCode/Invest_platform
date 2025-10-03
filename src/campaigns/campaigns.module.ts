import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '../entities/campaign.entity';
import { Contribution } from '../entities/contribution.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { EventListenerService } from './event-listener.service';
import { TrendingService } from './trending.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { RolesModule } from '../roles/roles.module';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, Contribution]),
    BlockchainModule,
    RedisCacheModule,
    RolesModule,
    AwsModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService, EventListenerService, TrendingService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
