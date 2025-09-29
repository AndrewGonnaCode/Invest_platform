import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CoingeckoService, TokenPrice } from './coingecko.service';

@ApiTags('prices')
@Controller('prices')
export class PriceController {
  constructor(private readonly coingeckoService: CoingeckoService) {}

  @Get('token/:address')
  @ApiOperation({ summary: 'Получить цену токена по адресу контракта' })
  @ApiParam({ name: 'address', description: 'Адрес контракта токена' })
  @ApiQuery({ name: 'platform', required: false, description: 'Блокчейн платформа (по умолчанию ethereum)' })
  @ApiQuery({ name: 'currency', required: false, description: 'Валюта (по умолчанию usd)' })
  async getTokenPrice(
    @Param('address') address: string,
    @Query('platform') platform: string = 'ethereum',
    @Query('currency') currency: string = 'usd',
  ): Promise<TokenPrice | null> {
    return this.coingeckoService.getTokenPrice(address, platform, currency);
  }

  @Get('eth')
  @ApiOperation({ summary: 'Получить цену ETH' })
  @ApiQuery({ name: 'currency', required: false, description: 'Валюта (по умолчанию usd)' })
  async getEthPrice(
    @Query('currency') currency: string = 'usd',
  ): Promise<{ price: number | null; currency: string }> {
    const price = await this.coingeckoService.getEthPrice(currency);
    return { price, currency };
  }

  @Get('cache/info')
  @ApiOperation({ summary: 'Информация о кэше цен' })
  getCacheInfo(): { size: number } {
    return { size: this.coingeckoService.getCacheSize() };
  }

  @Get('cache/clear')
  @ApiOperation({ summary: 'Очистить кэш цен' })
  clearCache(): { message: string } {
    this.coingeckoService.clearCache();
    return { message: 'Cache cleared successfully' };
  }
}
