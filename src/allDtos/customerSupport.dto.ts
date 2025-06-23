import {
  Entity,
  Column,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class customerSupport {
  id: string;

  msgId: string;

  client: boolean;

  msg;

  subject: string;

  senderId: string;

  companyId: string;

  createdAt: Date;

  modifiedAt: Date;
}
