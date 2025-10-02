import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as vault from 'node-vault';

@Injectable()
export class VaultService implements OnModuleInit {
  private readonly logger = new Logger(VaultService.name);
  private vaultClient: any;
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const vaultUrl = this.configService.get<string>('VAULT_ADDR');
      const vaultToken = this.configService.get<string>('VAULT_TOKEN');

      if (!vaultUrl || !vaultToken) {
        this.logger.error(
          'Vault configuration missing (VAULT_ADDR or VAULT_TOKEN)',
        );
        return;
      }

      this.vaultClient = vault({
        apiVersion: 'v1',
        endpoint: vaultUrl,
        token: vaultToken,
      });

      // Проверка подключения
      await this.vaultClient.health();
      this.isInitialized = true;
      this.logger.log('Successfully connected to HashiCorp Vault');
    } catch (error) {
      this.logger.error('Failed to initialize Vault client', error);
      throw error;
    }
  }

  async getSecret(path: string, key?: string): Promise<string | any> {
    if (!this.isInitialized) {
      this.logger.warn(
        'Vault is not initialized. Falling back to environment variables.',
      );
      return null;
    }

    try {
      const result = await this.vaultClient.read(path);
      const data = result.data.data || result.data;

      if (key) {
        return data[key];
      }

      return data;
    } catch (error) {
      this.logger.error(`Failed to read secret from path: ${path}`, error);
      throw error;
    }
  }

  async writeSecret(
    path: string,
    data: Record<string, any>,
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Vault is not initialized');
    }

    try {
      await this.vaultClient.write(path, { data });
      this.logger.log(`Secret written to path: ${path}`);
    } catch (error) {
      this.logger.error(`Failed to write secret to path: ${path}`, error);
      throw error;
    }
  }

  isVaultEnabled(): boolean {
    return this.isInitialized;
  }
}
