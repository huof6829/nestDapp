import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['wallet'])
export class WalletEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  wallet: string;

  @Column()
  timestamp: Date;
}
