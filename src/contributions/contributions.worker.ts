import { Worker } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Contribution } from '../entities/contribution.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { parseEther } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContributionsWorker {
  private worker: Worker;
  private readonly logger = new Logger(ContributionsWorker.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly blockchain: BlockchainService,
    private readonly config: ConfigService
  ) {
    this.worker = new Worker(
      'contributions-queue',
      async (job) => {
        console.log('worker processing', job.data)
        const { contributionId, amount, walletAddress, campaignAddress } =
          job.data;

        this.logger.log(`Processing contribution ${contributionId}...`);

        const contributionRepo =
          this.dataSource.getRepository(Contribution);

        try {
          // 1. Отправляем транзакцию
          const contract = this.blockchain.getCampaignContract(campaignAddress);
          const tx = await contract.donate({
            value: parseEther(amount),
          });
          await tx.wait(1);

          // 2. Обновляем запись
          await contributionRepo.update(contributionId, {
            status: 'confirmed',
            txHash: tx.hash,
          });

          this.logger.log(
            `Contribution ${contributionId} confirmed: ${tx.hash}`,
          );
        } catch (err) {
          this.logger.error(`Contribution ${contributionId} failed`, err);

          await contributionRepo.update(contributionId, {
            status: 'failed',
          });
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
