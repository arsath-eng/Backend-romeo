import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { performanceComment } from '../allDtos/subDtos/performanceComment.dto';

@Entity()
export class HrmPerformanceTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  task:string;

  @Column()
  description:string;

  @Column()
  empScore:string;

  @Column()
  supScore:string;

  @Column()
  status:string;

  @Column()
  creatorId:string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  comments:performanceComment[];

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column()
  companyId:string;

  @Column()
  score:string;
}
