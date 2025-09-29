import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonRpcProvider, Wallet, Contract, TransactionResponse } from 'ethers';
import { FactoryAbi } from './abi/Factory.abi';
import { CampaignAbi } from './abi/Campaign.abi';

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private factory: Contract;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.configService.get<string>('ETH_PROVIDER_URL');
    const privKey = this.configService.get<string>('PRIVATE_KEY');
    const factoryAddress = this.configService.get<string>(
      'CAMPAIGN_FACTORY_ADDRESS',
    );
    if (!rpcUrl || !privKey || !factoryAddress) {
      this.logger.warn(
        'Blockchain configuration missing; provider or factory not initialized.',
      );
      return;
    }
    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(privKey, this.provider);
    this.factory = new Contract(
      factoryAddress,
      FactoryAbi,
      this.wallet,
    );
  }

  onModuleDestroy() {
    // nothing to teardown for ethers v6
  }

  getFactory() {
    return this.factory;
  }

  getProvider() {
    return this.provider;
  }

  getCampaignContract(address: string) {
    return new Contract(address, CampaignAbi, this.wallet ?? this.provider);
  }
}
