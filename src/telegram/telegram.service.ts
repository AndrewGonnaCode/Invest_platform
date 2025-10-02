import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  private chatId: string;
  private readonly logger = new Logger(TelegramService.name);

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.logger.log('Initializing Telegram service...');

    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env');
    }

    this.bot = new TelegramBot(token, { polling: false });
  }

  async sendMessage(text: string) {
    if (!this.chatId) {
      throw new Error('TELEGRAM_CHAT_ID is not defined in .env');
    }

    return this.bot.sendMessage(this.chatId, text, { parse_mode: 'Markdown' });
  }
}
