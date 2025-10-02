import { Worker } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Contribution } from '../entities/contribution.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { parseEther } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { Campaign } from '../entities/campaign.entity';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class ContributionsWorker {
  private worker: Worker;
  private readonly logger = new Logger(ContributionsWorker.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly blockchain: BlockchainService,
    private readonly config: ConfigService,
    private readonly telegramService: TelegramService,
  ) {
    this.worker = new Worker(
      'contributions-queue',
      async (job) => {
        console.log('worker processing', job.data)
        const { contributionId, amount, walletAddress, campaignAddress } =
          job.data;

        this.logger.log(`Processing contribution ${contributionId}...`);;

        const campaign = await this.dataSource.getRepository(Campaign).findOne({
          where: { contractAddress: campaignAddress },
        });

        if (!campaign) {
          throw new Error('Campaign not found or not deployed');
        }

        const contributionRepo =
          this.dataSource.getRepository(Contribution);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const contract = this.blockchain.getCampaignContract(campaignAddress);
          const tx = await contract.donate({
            value: parseEther(amount),
          });
          await tx.wait(1);

          await contributionRepo.update(contributionId, {
            status: 'confirmed',
            txHash: tx.hash,
          });

          await queryRunner.manager.increment(
            Campaign,
            { id: campaign.id },
            'totalDonations',
            amount,
          )

          await queryRunner.commitTransaction();

          this.logger.log(
            `Contribution ${contributionId} confirmed: ${tx.hash}`,
          );

          await this.telegramService.sendMessage(
            `Contribution ${contributionId} confirmed: ${tx.hash}`,
          );
        } catch (err) {
          this.logger.error(`Contribution ${contributionId} failed`, err);

          await contributionRepo.update(contributionId, {
            status: 'failed',
          });
        } finally {
          await queryRunner.release();
        }
      },
      {
        connection: {
            host: this.config.get('REDIS_HOST'),
            port: this.config.get('REDIS_PORT'),
        },
      },
    );
  }
}
