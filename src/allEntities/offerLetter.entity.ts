import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  Timestamp,
} from 'typeorm';

@Entity()
export class HrmOfferLetter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateId: string;

  @Column()
  email: string;

  @Column('json')
  candidateInfo;

  @Column('json')
  data;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
})
  files;

  @Column()
  uploadedFile: string;

  @Column()
  fileLink: string;

  @Column()
  format: string;


  @Column()
  expiredDate: string;

  @Column()
  type: string;

  @Column('json')
  job;

  @Column('json')
  compensation;

  @Column('json')
  whoContact;

  @Column('json')
  sentBy;

  @Column()
  companyId: string;

  @Column()
  seen: boolean;

  @Column()
  submit: boolean;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;
}
