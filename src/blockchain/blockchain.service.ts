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
import { VaultService } from '../vault/vault.service';

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private factory: Contract;

  constructor(
    private readonly configService: ConfigService,
    private readonly vaultService: VaultService,
  ) {}

  async onModuleInit() {
    const rpcUrl = this.configService.get<string>('ETH_PROVIDER_URL');
    const factoryAddress = this.configService.get<string>(
      'CAMPAIGN_FACTORY_ADDRESS',
    );
    
    let privKey: string;

    // Пытаемся получить приватный ключ из Vault
    const vaultSecretPath = this.configService.get<string>('VAULT_SECRET_PATH') || 'secret/data/crowdfunding';

    if (this.vaultService.isVaultEnabled()) {
      try {
        this.logger.log('Fetching private key from Vault...');
        privKey = await this.vaultService.getSecret(vaultSecretPath, 'PRIVATE_KEY');

        console.log('PRIVATE_KEY', privKey);
        
        if (!privKey) {
          this.logger.warn('Private key not found in Vault, falling back to env variable');
          privKey = this.configService.get<string>('PRIVATE_KEY');
        } else {
          this.logger.log('Successfully retrieved private key from Vault');
        }
      } catch (error) {
        this.logger.error('Failed to fetch private key from Vault, using env variable', error);
        privKey = this.configService.get<string>('PRIVATE_KEY');
      }
    } else {
      this.logger.log('Vault is disabled, using private key from environment variables');
      privKey = this.configService.get<string>('PRIVATE_KEY');
    }

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