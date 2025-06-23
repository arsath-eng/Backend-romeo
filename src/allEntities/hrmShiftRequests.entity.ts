
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class HrmShiftRequests {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  shiftId: string;

  @Column({ nullable: true })
  employeeId: string;

  @Column()
  siteName: string;

  @Column()
  positionName: string;

  @Column()
  shiftDate: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ default: false })
  isOvertime: boolean;

  @Column()
  companyId: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  changedBy?: string;

  @Column({nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('text', { array: true, nullable: true })
  openShiftRequests: string[];

}
