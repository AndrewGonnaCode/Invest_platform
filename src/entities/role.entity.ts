import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum RoleName {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    type: 'enum', 
    enum: RoleName,
    unique: true 
  })
  name: RoleName;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
