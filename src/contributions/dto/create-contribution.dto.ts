import { ApiProperty } from '@nestjs/swagger';
import {
  IsEthereumAddress,
  IsNumberString,
} from 'class-validator';

export class CreateContributionDto {
  @ApiProperty({ description: 'Contributor wallet address' })
  @IsEthereumAddress()
  contributorAddress: string;

  @ApiProperty({ description: 'Amount in ETH as string' })
  @IsNumberString()
  amount: string;
}
