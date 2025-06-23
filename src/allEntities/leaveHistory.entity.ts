import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class HrmLeaveHistory {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  employeeId: string;

  @Column()
  categoryId: string;

  @Column()
  changedBy: string;

  @Column()
  amount: string;

  @Column()
  action: string;

  @Column()
  date: string;

  @Column()
  actionType: string;

  @Column()
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;
}
