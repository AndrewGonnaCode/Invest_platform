import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KafkaService, ContributionJobData } from './kafka.service';

@ApiTags('kafka')
@Controller('kafka')
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}
  @Post('test/contribution')
  @ApiOperation({ summary: 'Test sending contribution job to Kafka' })
  @ApiResponse({ status: 200, description: 'Contribution job sent successfully' })
  async testContributionJob(@Body() data: ContributionJobData) {
    await this.kafkaService.sendContributionJob(data);
    return { 
      success: true, 
      message: `Contribution job sent for ID: ${data.contributionId}` 
    };
  }
}
