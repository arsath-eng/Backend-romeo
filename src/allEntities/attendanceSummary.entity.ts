import { bool } from 'aws-sdk/clients/signer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  Timestamp,
} from 'typeorm';

@Entity()
export class HrmAttendanceSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  employeeId: string;

  @Column()
  weekStartDate: string;

  @Column()
  weekEndDate: string;

  @Column({type:'jsonb', array: false, default: () => "'[]'"})
  weeklySummary;

  @Column()
  status: string;

  @Column()
  companyId: string;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;
}
