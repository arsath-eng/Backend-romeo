import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TemporaryAddress {
  @PrimaryGeneratedColumn('uuid')
  no: string;

  street: string;

  city: string;

  state: string;

  zip: number;

  country: string;

  accepted: boolean;

  period: string;
}
