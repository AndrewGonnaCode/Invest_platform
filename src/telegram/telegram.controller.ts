import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('notify')
  async notify(@Body() body: { message: string }) {
    return this.telegramService.sendMessage(
      body.message,
    );
  }
}
