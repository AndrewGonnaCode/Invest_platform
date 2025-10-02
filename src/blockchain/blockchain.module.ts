import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BlockchainService } from './blockchain.service';
import { PriceController } from './price.controller';
import { CoingeckoService } from './coingecko.service';
import { VaultModule } from 'src/vault/vault.module';

@Global()
@Module({
  imports: [HttpModule, VaultModule],
  controllers: [PriceController],
  providers: [BlockchainService, CoingeckoService],
  exports: [BlockchainService, CoingeckoService],
})
export class BlockchainModule {}
