import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Campaign } from '../entities/campaign.entity';
import { Contribution } from '../entities/contribution.entity';
import { Role } from '../entities/role.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5434', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'root',
  database: process.env.POSTGRES_DB || 'crowdfunding',
  entities: [User, Campaign, Contribution, Role],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false, // Важно! Отключаем для работы с миграциями
  logging: true,
});
