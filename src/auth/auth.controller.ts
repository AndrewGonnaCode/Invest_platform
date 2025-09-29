import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { VerifyDto } from './dto/verify.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('nonce')
  async nonce() {
    return this.authService.generateNonce();
  }

  @Post('verify')
  async verify(@Body() dto: VerifyDto) {
    return this.authService.verifySignature(dto);
  }
}
