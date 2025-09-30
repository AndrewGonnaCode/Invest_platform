import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  const configService = app.get(ConfigService);
  const redisUrl =
    configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
  const sessionSecret =
    configService.get<string>('SESSION_SECRET') ?? 'changeme';


  const redisClient = new Redis(redisUrl);
  const store = new RedisStore({ client: redisClient as any });

  app.use(
    session({
      store: store as any,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Web3 Crowdfunding Platform API')
    .setDescription(
      'REST API for a Web3 crowdfunding platform using NestJS, PostgreSQL, Redis, and Ethers.js',
    )
    .setVersion('1.0.0')
    .addCookieAuth('connect.sid')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}

bootstrap();
