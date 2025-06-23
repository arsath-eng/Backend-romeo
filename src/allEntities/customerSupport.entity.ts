import {
  Entity,
  Column,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class HrmCustomerSupport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable:true})
  msgId: string;

  @Column()
  client: boolean;

  @Column('json')
  msg;

  @Column()
  subject: string;

  @Column()
  senderId: string;

  @Column()
  companyId: string;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;
}
