import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';

@ApiTags('contributions')
@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post('campaign/:campaignId')
  contribute(
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateContributionDto,
  ) {
    return this.contributionsService.contribute(parseInt(campaignId, 10), dto);
  }

  @Get('all')
  list() {
    return this.contributionsService.getAllContributions()
  }

  @Get('campaign/:campaignId')
  listByCampaign(@Param('campaignId') campaignId: string) {
    return this.contributionsService.listByCampaign(parseInt(campaignId, 10));
  }

  @Get('by-user/:wallet')
  listByUser(@Param('wallet') wallet: string) {
    return this.contributionsService.listByUser(wallet);
  }
}
