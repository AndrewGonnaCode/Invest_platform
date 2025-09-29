import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Campaign } from '../entities/campaign.entity';
import { Contribution } from '../entities/contribution.entity';
import { RedisCacheService } from '../redis-cache/redis-cache.service';

@Injectable()
export class EventListenerService implements OnModuleInit {
  private readonly logger = new Logger(EventListenerService.name);

  constructor(
    private readonly blockchain: BlockchainService,
    @InjectRepository(Campaign)
    private readonly campaignsRepo: Repository<Campaign>,
    @InjectRepository(Contribution)
    private readonly contributionsRepo: Repository<Contribution>,
    private readonly redis: RedisCacheService,
  ) {}

  onModuleInit() {
    const factory = this.blockchain.getFactory();
    if (!factory) {
      this.logger.warn(
        'Factory contract not initialized; event listeners disabled',
      );
      return;
    }

    // factory.on(
    //   'CompanyCreated',
    //   async (
    //     campaignAddress: string,
    //     creator: string,
    //     title: string,
    //     goal: bigint,
    //     deadline: bigint,
    //   ) => {
    //     console.log("Listener")
    //     try {
    //       const exists = await this.campaignsRepo.findOne({
    //         where: { contractAddress: campaignAddress.toLowerCase() },
    //       });
    //       if (exists) return;
    //       const campaign: Campaign = this.campaignsRepo.create({
    //         title,
    //         description: '',
    //         goalAmount: (Number(goal) / 1e18).toString(),
    //         deadline: new Date(Number(deadline) * 1000),
    //         creatorAddress: creator.toLowerCase(),
    //         contractAddress: campaignAddress.toLowerCase(),
    //       } as Partial<Campaign>);
    //       const saved: Campaign = await this.campaignsRepo.save(campaign);
    //       await this.redis.lpush(
    //         'recent:campaigns',
    //         JSON.stringify({ id: saved.id, title: saved.title }),
    //       );
    //       await this.redis.ltrim('recent:campaigns', 0, 9);
    //     } catch (e) {
    //       this.logger.error('Error handling CampaignCreated', e as any);
    //     }
    //   },
    // );

    // Listen globally for ContributionReceived for each known campaign
    // this.campaignsRepo.find().then((campaigns) => {
    //   campaigns.forEach((c) =>
    //     this.attachContributionListener(c.contractAddress),
    //   );
    // });
  }

  private attachContributionListener(contractAddress?: string | null) {
    if (!contractAddress) return;
    const contract = this.blockchain.getCampaignContract(contractAddress);
    contract.on(
      'DonationReceived',
      async (contributor: string, amount: bigint) => {
        try {
          const campaign = await this.campaignsRepo.findOne({
            where: { contractAddress: contractAddress.toLowerCase() },
          });
          if (!campaign) return;
          const record: Contribution = this.contributionsRepo.create({
            campaignId: campaign.id,
            contributorAddress: contributor.toLowerCase(),
            amount: (Number(amount) / 1e18).toString(),
            txHash: '',
          } as Partial<Contribution>);
          const saved: Contribution = await this.contributionsRepo.save(record);
          await this.redis.lpush(
            'recent:contributions',
            JSON.stringify({
              campaignId: saved.campaign.id,
              amount: saved.amount,
            }),
          );
          await this.redis.ltrim('recent:contributions', 0, 9);
        } catch (e) {
          this.logger.error('Error handling ContributionReceived', e as any);
        }
      },
    );
  }
}
