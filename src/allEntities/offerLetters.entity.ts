import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class OfferLetters {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateId: string;

  @Column('jsonb')
  content: any;

  @Column()
  expireDate: string;

  @Column()
  startDate: string;

  @Column('jsonb')
  job: {
    id: string;
    name: string;
  };

  @Column()
  salary: string;

  @Column()
  payPeriod: string;

  @Column('simple-array',{nullable:true})
  files: string[];

  @Column()
  supervisor: string;

  @Column()
  status: string;

  @Column()
  seen: boolean;

  @Column({nullable:true})
  accept: boolean;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;
}
