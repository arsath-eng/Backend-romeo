import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class HrmTrainingComplete {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable:true})
  trainingId: string;

  @Column({nullable:true})
  note: string;

  @Column('simple-array',{nullable:true})
  attachFiles;

  @Column()
  employeeId: string;

  @Column({nullable:true})
  cost: string;

  @Column({nullable:true})
  completedDate: string;

  @Column({nullable:true})
  currency: string;

  @Column({nullable:true})
  credits: string;

  @Column({nullable:true})
  hours: string;

  @Column({nullable:true})
  instructor: string;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column({ nullable: true })
  companyId: string;
}
