import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contribution } from './contribution.entity';

@Entity({ name: 'campaigns' })
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric', precision: 36, scale: 18 })
  goalAmount: string;

  @Column({ type: 'numeric', precision: 36, scale: 18, nullable: true, default: 0 })
  totalDonations: string;

  @Column({ type: 'timestamptz' })
  deadline: Date;

  @Column()
  creatorAddress: string;

  @Column({ nullable: true })
  contractAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Contribution, (contribution) => contribution.campaign)
  contributions: Contribution[];
}
