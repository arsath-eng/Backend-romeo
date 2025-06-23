import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class HrmConfigs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'json'})
  data;

  @Column()
  type: string;
  
  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column()
  companyId: string;
}
