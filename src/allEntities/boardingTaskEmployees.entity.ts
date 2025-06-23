import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class HrmBoardingTaskEmployees {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  preDefined: boolean;

  @Column()
  taskId: string;

  @Column('json')
  form;

  @Column()
  completed: boolean;

  @Column()
  completedBy: string;

  @Column()
  completedDate: string;

  @Column()
  type: string;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column({ nullable: true })
  companyId: string;
}
