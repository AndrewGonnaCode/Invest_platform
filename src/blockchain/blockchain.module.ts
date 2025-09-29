import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BlockchainService } from './blockchain.service';
import { PriceController } from './price.controller';
import { CoingeckoService } from './coingecko.service';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [PriceController],
  providers: [BlockchainService, CoingeckoService],
  exports: [BlockchainService, CoingeckoService],
})
export class BlockchainModule {}
