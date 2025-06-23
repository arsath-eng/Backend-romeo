import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class HrmLeaveCategories {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({nullable: true})
  timeOffCategoryType: string;

  @Column()
  color: string;

  @Column()
  icon: string;

  @Column('json')
  assignees;

  @Column()
  timeUnit: string;

  @Column('json')
  approve;

  @Column('json')
  automaticAccrual;

  @Column('json')
  carryOver: {
    option: string,
    maxAmount: string
  };

  @Column()
  allowHalfDay: boolean;

  @Column()
  allowNegativeBalance: boolean;

  @Column()
  coverupPerson: boolean;

  @Column('json')
  requireUploadFile: {
    enable: boolean,
    exceedAmount: string
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column()
  companyId: string;
}
