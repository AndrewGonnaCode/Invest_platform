import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Contribution } from '../entities/contribution.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { Campaign } from '../entities/campaign.entity';
import { isAddress, parseEther } from 'ethers';
import { UsersService } from 'src/users/users.service';
import { ContributionJobData, KafkaService } from 'src/kafka/kafka.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { ContributionsQueue } from './contributions.queue';

@Injectable()
export class ContributionsService {
  private readonly logger = new Logger(ContributionsService.name);
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionsRepo: Repository<Contribution>,
    @InjectRepository(Campaign)
    private readonly campaignsRepo: Repository<Campaign>,
    private readonly usersService: UsersService,
    private readonly contributionsQueue: ContributionsQueue,
    private readonly dataSource: DataSource,
    // private readonly kafkaService: KafkaService,
     private readonly blockchain: BlockchainService,
  ) {}

  async contribute(campaignId: number, dto: CreateContributionDto) {
    const campaign = await this.campaignsRepo.findOne({
      where: { id: campaignId },
    });
    if (!campaign || !campaign.contractAddress) {
      throw new Error('Campaign not found or not deployed');
    }
    const user = await this.usersService.findByWallet(dto.contributorAddress);
    
    if(!user){
      throw new Error('User not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    let contribution: Contribution;

    try {
      contribution = await queryRunner.manager.save(Contribution, {
        campaign: { id: campaign.id },
        contributor:{id:user.id},
        amount: dto.amount,
        txHash: '',
        status: 'pending',
      });

      this.logger.log(`Contribution ${contribution.id} added to queue`);
    } catch (error) {
      // await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to add contribution ${contribution.id} to queue`, error);
      throw error;
    } 


    await this.contributionsQueue.addContributionJob(contribution.id, {
      amount: dto.amount,
      walletAddress: user.walletAddress,
      campaignAddress: campaign.contractAddress,
    });

      // Отправляем задачу в Kafka вместо BullMQ
    // await this.kafkaService.sendContributionJob({
    //     contributionId: saved.id,
    //     amount: dto.amount,
    //     walletAddress: user.walletAddress,
    //     campaignAddress: campaign.contractAddress,
    //   });

    return contribution;
  }

  async processContribution(data: ContributionJobData) {
      try {
        // 1. Отправляем транзакцию
        const contract = this.blockchain.getCampaignContract(data.campaignAddress);
        const tx = await contract.donate({
          value: parseEther(data.amount),
        });
        await tx.wait(1);
        
        // 2. Обновляем запись
        await this.contributionsRepo.update(data.contributionId, {
          status: 'confirmed',
          txHash: tx.hash,
        });
        
        this.logger.log(
          `Contribution ${data.contributionId} confirmed: ${tx.hash}`,
        );
      } catch (err) {
        this.logger.error(`Contribution ${data.contributionId} failed`, err);
        
        await this.contributionsRepo.update(data.contributionId, {
          status: 'failed',
        });
      }
    }
    

  getAllContributions() {
    return this.contributionsRepo.find({ order: { createdAt: 'DESC' }, relations: ['campaign', 'contributor'] });
  }

  listByCampaign(campaignId: number) {
    return this.contributionsRepo.find({
      where: { campaign: { id: campaignId } },
      relations: ['campaign', 'contributor'],
      order: { createdAt: 'DESC' },
    });
  }

  listByUser(walletAddress: string) {
    if (!isAddress(walletAddress)) {
      throw new BadRequestException('Invalid Ethereum address format');
    }
    
    return this.contributionsRepo.find({
      where: { contributor: {walletAddress:walletAddress.toLowerCase()} },
      relations: ['campaign', 'contributor'],
      order: { createdAt: 'DESC' },
    });
  }
}
