import { Injectable, OnModuleInit } from '@nestjs/common';
import { ContributionJobData, KafkaService } from '../kafka/kafka.service';
import { ContributionsService } from './contributions.service';
import { KafkaTopics } from 'src/kafka/topics';


@Injectable()
export class ContributionConsumer implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly contributionService: ContributionsService,
  ) {}

  async onModuleInit() {
    await this.kafkaService.subscribe(KafkaTopics.CONTRIBUTIONS_PROCESSING, async (data: ContributionJobData) => {
      await this.contributionService.processContribution(data);
    });
  }
}
