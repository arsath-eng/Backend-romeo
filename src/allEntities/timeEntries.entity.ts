
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class HrmTimeEntries {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: string;

  @Column()
  type: string;

  @Column()
  employeeId: string;

  @Column()
  hasPeriod: boolean;

  @Column()
  start: boolean;

  @Column()
  duration: string;

  @Column()
  beginTime: string;

  @Column()
  endTime: string;

  @Column()
  billable: boolean;

  @Column()
  billedStatus: string;
  
  @Column()
  projectId: string;

  @Column()
  taskId: string;

  @Column()
  note: string;

  @Column()
  inProgress: boolean;

  @Column({nullable: true})
  isApproved: boolean;

  @Column({nullable: true})
  isRequested: boolean;

  @Column()
  startTime: string;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;
}
