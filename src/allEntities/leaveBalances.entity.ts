import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class HrmLeaveBalances {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  employeeId: string;

  @Column('uuid', {nullable: true})
  categoryId;
  
  @Column()
  total: string;
  
  @Column()
  used: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;
}
