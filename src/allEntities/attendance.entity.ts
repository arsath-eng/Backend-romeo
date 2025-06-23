import { bool } from 'aws-sdk/clients/signer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class HrmAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  employeeId: string;

  @Column()
  date: string;

  @Column()
  isOnline: boolean;

  @Column()
  isApproved: boolean;

  @Column()
  locationType: string;

  @Column({nullable:true})
  location: string;


  @Column({type:'jsonb', array: false, default: () => "'[]'"})
  timeEntries;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;
}

@Entity()
export class HrmAttendanceRequests {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  status: string;

  @Column()
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  isOvertime: boolean;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;
}
