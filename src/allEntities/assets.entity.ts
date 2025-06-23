import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AccAssets {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: true})
  employeeId: string;

  @Column({nullable: true})
  aseetsCategoryId: string;

  @Column({nullable: true})
  assetsDescription: string;

  @Column({nullable: true})
  serial: string;

  @Column({nullable: true})
  dateAssigned: string;

  @Column({nullable: true})
  dateReturned: string;

  @Column({default: 'pending'})
  status: string;
 
  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column()
  companyId: string;

  @Column({default: ''})
  requesterId: string;
}
