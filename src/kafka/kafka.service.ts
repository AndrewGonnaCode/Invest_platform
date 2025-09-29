import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { KafkaTopics } from './topics';

export interface ContributionJobData {
  contributionId: number;
  amount: string;
  walletAddress: string;
  campaignAddress: string;
}

type MessageHandler = (data: any) => Promise<void> | void;

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
) {
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID', 'crowdfunding-app'),
      brokers: [this.configService.get('KAFKA_BROKER', 'localhost:9092')],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: this.configService.get('KAFKA_GROUP_ID', 'crowdfunding-consumer') });
  }
  
  getConsumer() {
    return this.consumer;
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();

    this.logger.log('Kafka producer and consumer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async sendContributionJob(data: ContributionJobData): Promise<void> {
    await this.producer.send({
      topic: KafkaTopics.CONTRIBUTIONS_PROCESSING,
      messages: [
        {
          key: `contribution-${data.contributionId}`,
          value: JSON.stringify(data),
        },
      ],
    });
    this.logger.log(`Contribution job sent for ID: ${data.contributionId}`);
  }

  async sendMessage(topic: string, message: any): Promise<void> {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    this.logger.log(`Message sent to topic ${topic}`);
  }

   // Consumer subscribe API
   async subscribe(topic: string, handler: MessageHandler) {
    await this.consumer.subscribe({ topic, fromBeginning: false });
    this.logger.log(`Subscribed handler to topic ${topic}`);

    await this.consumer.run({
        eachMessage: async ({ topic, message }: EachMessagePayload) => {
          const value = message.value?.toString();
          if (!value) return;
  
          this.logger.debug(`Message from ${topic}: ${value}`);
          const data = JSON.parse(value);

          await handler(data);
        },
      });
  }
}
