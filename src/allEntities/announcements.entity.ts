import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HrmAnnouncements {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  title: string;

  @Column('json')
  email;

  @Column('simple-array')
  attachFiles;

  @Column()
  emailSend: boolean;

  @Column()
  emailAll: boolean;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  emailList;

  @Column({default: 'pending'})
  status: string;

  @Column()
  author: string;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column({ nullable: true })
  companyId: string;
}
