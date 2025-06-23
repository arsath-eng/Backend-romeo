import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AccClaims {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable: true})
  employeeId: string;
  @Column({nullable: true})
  claimDate: string;

  @Column({nullable: true})
  claimCategory: string;

  @Column({nullable: true})
  claimComment: string;

  @Column({nullable: true})
  fileId: string;

  @Column({nullable: true})
  fileLink: string;

  @Column({nullable: true})
  comment: string;

  @Column({nullable: true})
  action: string;

  @Column({nullable: true})
  paidBy: string;

  @Column({default: 'pending'})
  status: string;

  @Column()
  amount: string;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column()
  companyId: string;

  @Column({default: ''})
  requesterId: string;
}
