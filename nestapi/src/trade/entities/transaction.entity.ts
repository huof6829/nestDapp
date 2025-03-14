import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string; // 交易数据

  @Column()
  timestamp: Date; // 时间戳

  @Index()
  @Column()
  kind: string;

  @Column()
  price: number;
}
