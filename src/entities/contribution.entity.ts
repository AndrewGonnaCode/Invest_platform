import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Campaign } from './campaign.entity';
import { User } from './user.entity';

@Entity({ name: 'contributions' })
export class Contribution {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Campaign, (campaign) => campaign.contributions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @ManyToOne(() => User, (user) => user.contributions, { nullable: true })
  contributor: User | null;

  @Column({ type: 'numeric', precision: 36, scale: 18 })
  amount: string;

  @Column({ unique: false })
  txHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'confirmed' | 'failed';

}
