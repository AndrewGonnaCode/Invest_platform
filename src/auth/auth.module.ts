import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
  UsersModule, 
  RedisCacheModule, 
  JwtModule.register({
    secret: process.env.JWT_SECRET || 'SECRET',
    signOptions: {
      expiresIn: '24h',
    },
  }),],
  controllers: [AuthController],
  providers: [AuthService],
  exports:[JwtModule]
})
export class AuthModule {}
