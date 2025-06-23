import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  Timestamp,
  Index,
} from 'typeorm';

@Entity()
export class HrmNotifications {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
  })
  readIds;

  @Column('json')
  referenceIds;

  @Index()
  @Column()
  type: string;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @Column('uuid')
  companyId: string;
}
