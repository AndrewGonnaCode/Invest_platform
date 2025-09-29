import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { TrendingService } from './trending.service';
import { Roles } from 'src/auth/roles.decorator';
import { RoleName } from 'src/entities/role.entity';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly trendingService: TrendingService,
  ) {}

  @Post()
  // @UseGuards(AdminGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Create new campaign (Admin only)' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @Get('all')
  list() {
    return this.campaignsService.list();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: string) {
    return this.campaignsService.findById(parseInt(id, 10));
  }

  @Get(':id/total')
  @ApiOperation({ summary: 'Получить общую сумму контрибуций для кампании' })
  @ApiParam({ name: 'id', description: 'ID кампании' })
  @ApiResponse({ 
    status: 200, 
    description: 'Общая сумма контрибуций и количество',
    schema: {
      type: 'object',
      properties: {
        totalAmount: { type: 'string', description: 'Общая сумма в ETH' },
        contributionsCount: { type: 'number', description: 'Количество контрибуций' }
      }
    }
  })
  getTotalContributions(@Param('id', ParseIntPipe) id: number) {
    return this.campaignsService.getTotalContributions(id);
  }

  @Get('status/trending')
  trending() {
    return this.trendingService.getTrending();
  }
}
