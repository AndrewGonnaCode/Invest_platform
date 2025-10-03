import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './entities/user.entity';
import { Campaign } from './entities/campaign.entity';
import { Contribution } from './entities/contribution.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContributionsModule } from './contributions/contributions.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { Role } from './entities/role.entity';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { RolesModule } from './roles/roles.module';
import { VaultModule } from './vault/vault.module';
import { TelegramModule } from './telegram/telegram.module';
import { AwsModule } from './aws/aws.module';
import { makeCounterProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { CampaignsModule } from './campaigns/campaigns.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [`.env.${process.env.NODE_ENV}`, '.env']}),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST') ?? 'localhost',
        port: parseInt(config.get<string>('POSTGRES_PORT') ?? '5433', 10),
        username: config.get<string>('POSTGRES_USER') ?? 'postgres',
        password: config.get<string>('POSTGRES_PASSWORD') ?? 'postgres',
        database: config.get<string>('POSTGRES_DB') ?? 'crowdfunding',
        entities: [User, Campaign, Contribution, Role],
        synchronize: false,
        migrations: ['dist/migrations/*.js'],
        logging: false,
      }),
    }),
    PrometheusModule.register({
      path: '/metrics', // эндпоинт для метрик
    }),
    AuthModule,
    UsersModule,
    CampaignsModule,
    ContributionsModule,
    VaultModule,
    RedisCacheModule,
    BlockchainModule,
    RolesModule,
    TelegramModule,
    AwsModule,
    // MetricsModule,
    // KafkaModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'HTTP-запросы по контроллерам',
      labelNames: ['controller', 'method'],
    }),
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
