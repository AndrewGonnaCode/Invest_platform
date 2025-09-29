import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Goal amount in ETH as string' })
  @IsNumberString()
  goalAmount: string;

  @ApiProperty()
  @IsDateString()
  deadline: string;

  @ApiProperty()
  @IsEthereumAddress()
  creatorAddress: string;
}
