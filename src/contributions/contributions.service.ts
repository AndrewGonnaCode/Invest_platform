import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contribution } from '../entities/contribution.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { Campaign } from '../entities/campaign.entity';
import { isAddress, parseEther } from 'ethers';
import { UsersService } from 'src/users/users.service';
import { ContributionJobData, KafkaService } from 'src/kafka/kafka.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';

@Injectable()
export class ContributionsService {
  private readonly logger = new Logger(ContributionsService.name);
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionsRepo: Repository<Contribution>,
    @InjectRepository(Campaign)
    private readonly campaignsRepo: Repository<Campaign>,
    private readonly usersService: UsersService,
    private readonly kafkaService: KafkaService,
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

    const contribution:Contribution = this.contributionsRepo.create({
      campaign: { id: campaign.id }, // ✅ привязка к Campaign
      contributor:{id:user.id},
      amount: dto.amount,
      txHash: '',
      status: 'pending',
    });

    const saved: Contribution = await this.contributionsRepo.save(contribution);

    this.logger.log(`Contribution ${saved.id} added to queue`);

    // await this.contributionsQueue.addContributionJob(saved.id, {
    //   amount: dto.amount,
    //   walletAddress: user.walletAddress,
    //   campaignAddress: campaign.contractAddress,
    // });

      // Отправляем задачу в Kafka вместо BullMQ
    await this.kafkaService.sendContributionJob({
        contributionId: saved.id,
        amount: dto.amount,
        walletAddress: user.walletAddress,
        campaignAddress: campaign.contractAddress,
      });

    return saved;
  }

  async processContribution(data: ContributionJobData) {
    this.logger.log(`Processing contribution: ${JSON.stringify(data)}`);
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
