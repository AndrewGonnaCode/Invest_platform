import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class VerifyDto {
  @ApiProperty()
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty()
  @IsString()
  @Length(16, 64)
  nonce: string;
}
