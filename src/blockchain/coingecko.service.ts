import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface TokenPrice {
  address: string;
  price: number;
  currency: string;
  lastUpdated: Date;
}

export interface CoingeckoTokenResponse {
  [tokenAddress: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

@Injectable()
export class CoingeckoService {
  private readonly logger = new Logger(CoingeckoService.name);
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly priceCache = new Map<string, { price: TokenPrice; expiry: number }>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 минут

  constructor(private readonly httpService: HttpService) {}

  /**
   * Получить цену токена по его контрактному адресу
   * @param tokenAddress - адрес контракта токена
   * @param platform - блокчейн платформа (по умолчанию ethereum)
   * @param currency - валюта для цены (по умолчанию usd)
   */
  async getTokenPrice(
    tokenAddress: string,
    platform: string = 'ethereum',
    currency: string = 'usd',
  ): Promise<TokenPrice | null> {
    const cacheKey = `${platform}:${tokenAddress.toLowerCase()}:${currency}`;
    
    // Проверяем кэш
    const cached = this.priceCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      this.logger.debug(`Cache hit for ${tokenAddress}`);
      return cached.price;
    }

    try {
      const url = `${this.baseUrl}/simple/token_price/${platform}`;
      const params = {
        contract_addresses: tokenAddress.toLowerCase(),
        vs_currencies: currency,
        include_24hr_change: 'true',
      };

      this.logger.debug(`Fetching price for ${tokenAddress} from CoinGecko`);
      
      const response: AxiosResponse<CoingeckoTokenResponse> = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      const tokenData = response.data[tokenAddress.toLowerCase()];
      
      if (!tokenData || !tokenData.usd) {
        this.logger.warn(`No price data found for token ${tokenAddress}`);
        return null;
      }

      const tokenPrice: TokenPrice = {
        address: tokenAddress.toLowerCase(),
        price: tokenData.usd,
        currency: currency,
        lastUpdated: new Date(),
      };

      // Сохраняем в кэш
      this.priceCache.set(cacheKey, {
        price: tokenPrice,
        expiry: Date.now() + this.cacheTimeout,
      });

      this.logger.debug(`Price for ${tokenAddress}: $${tokenPrice.price}`);
      return tokenPrice;

    } catch (error) {
      this.logger.error(`Failed to fetch price for ${tokenAddress}:`, error.message);
      return null;
    }
  }

  /**
   * Получить цены нескольких токенов одновременно
   * @param tokenAddresses - массив адресов токенов
   * @param platform - блокчейн платформа
   * @param currency - валюта для цены
   */
  async getMultipleTokenPrices(
    tokenAddresses: string[],
    platform: string = 'ethereum',
    currency: string = 'usd',
  ): Promise<TokenPrice[]> {
    if (tokenAddresses.length === 0) {
      return [];
    }

    // Проверяем кэш для каждого токена
    const results: TokenPrice[] = [];
    const uncachedAddresses: string[] = [];

    for (const address of tokenAddresses) {
      const cacheKey = `${platform}:${address.toLowerCase()}:${currency}`;
      const cached = this.priceCache.get(cacheKey);
      
      if (cached && Date.now() < cached.expiry) {
        results.push(cached.price);
      } else {
        uncachedAddresses.push(address);
      }
    }

    // Если все токены в кэше, возвращаем результат
    if (uncachedAddresses.length === 0) {
      return results;
    }

    try {
      const url = `${this.baseUrl}/simple/token_price/${platform}`;
      const params = {
        contract_addresses: uncachedAddresses.map(addr => addr.toLowerCase()).join(','),
        vs_currencies: currency,
        include_24hr_change: 'true',
      };

      this.logger.debug(`Fetching prices for ${uncachedAddresses.length} tokens from CoinGecko`);
      
      const response: AxiosResponse<CoingeckoTokenResponse> = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      // Обрабатываем ответ для некэшированных токенов
      for (const address of uncachedAddresses) {
        const tokenData = response.data[address.toLowerCase()];
        
        if (tokenData && tokenData.usd) {
          const tokenPrice: TokenPrice = {
            address: address.toLowerCase(),
            price: tokenData.usd,
            currency: currency,
            lastUpdated: new Date(),
          };

          results.push(tokenPrice);

          // Сохраняем в кэш
          const cacheKey = `${platform}:${address.toLowerCase()}:${currency}`;
          this.priceCache.set(cacheKey, {
            price: tokenPrice,
            expiry: Date.now() + this.cacheTimeout,
          });
        } else {
          this.logger.warn(`No price data found for token ${address}`);
        }
      }

      return results;

    } catch (error) {
      this.logger.error(`Failed to fetch multiple token prices:`, error.message);
      return results; // Возвращаем только кэшированные результаты
    }
  }

  /**
   * Получить цену ETH (нативной валюты Ethereum)
   */
  async getEthPrice(currency: string = 'usd'): Promise<number | null> {
    const cacheKey = `ethereum:native:${currency}`;
    
    // Проверяем кэш
    const cached = this.priceCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.price.price;
    }

    try {
      const url = `${this.baseUrl}/simple/price`;
      const params = {
        ids: 'ethereum',
        vs_currencies: currency,
      };

      this.logger.debug('Fetching ETH price from CoinGecko');
      
      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      const ethPrice = response.data.ethereum?.[currency];
      
      if (!ethPrice) {
        this.logger.warn('No ETH price data found');
        return null;
      }

      // Сохраняем в кэш
      const tokenPrice: TokenPrice = {
        address: 'native',
        price: ethPrice,
        currency: currency,
        lastUpdated: new Date(),
      };

      this.priceCache.set(cacheKey, {
        price: tokenPrice,
        expiry: Date.now() + this.cacheTimeout,
      });

      this.logger.debug(`ETH price: $${ethPrice}`);
      return ethPrice;

    } catch (error) {
      this.logger.error('Failed to fetch ETH price:', error.message);
      return null;
    }
  }

  /**
   * Очистить кэш цен
   */
  clearCache(): void {
    this.priceCache.clear();
    this.logger.debug('Price cache cleared');
  }

  /**
   * Получить размер кэша
   */
  getCacheSize(): number {
    return this.priceCache.size;
  }
}
