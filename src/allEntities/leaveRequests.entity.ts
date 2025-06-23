import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class HrmLeaveRequests {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  employeeId: string;

  @Column()
  categoryId: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column()
  fileId: string;

  @Column()
  coverupPersonId: string;

  @Column({default: 'pending'})
  status: string;

  @Column()
  totalHours: string;

  @Column()
  totalDays: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  dateList;

  @Column()
  note: string;

  @Column()
  notificationId: string;

  @Column()
  historyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;

  @Column({default: ''})
  requesterId: string;
}
