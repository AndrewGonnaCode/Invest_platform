import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../entities/campaign.entity';
import { Contribution } from '../entities/contribution.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { ZeroAddress, parseEther } from 'ethers';
import { AwsS3Service } from 'src/aws/aws-s3.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignsRepo: Repository<Campaign>,
    @InjectRepository(Contribution)
    private readonly contributionsRepo: Repository<Contribution>,
    private readonly blockchain: BlockchainService,
    private readonly redis: RedisCacheService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async create(dto: CreateCampaignDto) {
    const goalWei = parseEther(dto.goalAmount);
    const factory = this.blockchain.getFactory();
    const tx = await factory.createCompany(
      dto.title,
      goalWei,
    );
    console.log('creation tx hash', tx.hash);
    const receipt = await tx.wait(1);
    const createdEvent = receipt?.logs
      .map((l: any) => {
        try {
          return factory.interface.parseLog(l);
        } catch (e) {
          return null;
        }
      })
      .find((e: any) => e && e.name === 'CompanyCreated');
    console.log('createdEvent', createdEvent);
    const campaignAddress = createdEvent?.args?.companyAddress as
      | string
      | undefined;
    console.log('campaignAddress', campaignAddress);
    const campaign: Campaign = this.campaignsRepo.create({
      title: dto.title,
      description: dto.description,
      goalAmount: dto.goalAmount,
      deadline: new Date(dto.deadline),
      creatorAddress: dto.creatorAddress.toLowerCase(),
      contractAddress: campaignAddress ?? null,
    } as Partial<Campaign>);
    const saved: Campaign = await this.campaignsRepo.save(campaign);
    await this.redis.lpush(
      'recent:campaigns',
      JSON.stringify({ id: saved.id, title: saved.title }),
    );
    await this.redis.ltrim('recent:campaigns', 0, 9);
    return saved;
  }

  list() {
    return this.campaignsRepo.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: number) {
    return this.campaignsRepo.findOne({ where: { id } });
  }

  async uploadAvatar(campaignId: number, file: Express.Multer.File): Promise<Campaign> {
    // Validate file
    this.awsS3Service.validateImageFile(file);

    // Find campaign
    const campaign = await this.campaignsRepo.findOne({ where: { id: campaignId } });
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Delete old avatar if exists
    if (campaign.avatarUrl) {
      try {
        await this.awsS3Service.deleteFile(campaign.avatarUrl);
      } catch (error) {
        console.warn('Failed to delete old avatar:', error.message);
      }
    }

    return campaign;
  }

  async removeAvatar(campaignId: number): Promise<Campaign> {
    const campaign = await this.campaignsRepo.findOne({ where: { id: campaignId } });
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.avatarUrl) {
      try {
        await this.awsS3Service.deleteFile(campaign.avatarUrl);
      } catch (error) {
        console.warn('Failed to delete avatar from S3:', error.message);
      }
      
      campaign.avatarUrl = null;
      return await this.campaignsRepo.save(campaign);
    }

    return campaign;
  }

  async getTotalContributions(campaignId: number): Promise<{ totalAmount: string; contributionsCount: number }> {
    const result = await this.contributionsRepo
      .createQueryBuilder('contribution')
      .select('SUM(CAST(contribution.amount AS DECIMAL))', 'totalAmount')
      .addSelect('COUNT(contribution.id)', 'contributionsCount')
      .where('contribution.campaignId = :campaignId', { campaignId })
      .andWhere('contribution.status = :status', { status: 'confirmed' })
      .getRawOne();

    return {
      totalAmount: (result.totalAmount || '0').toString().substring(0, 7),
      contributionsCount: parseInt(result.contributionsCount) || 0,
    };
  }
}
