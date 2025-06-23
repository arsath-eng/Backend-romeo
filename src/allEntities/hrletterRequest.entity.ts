
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class hrletterRequest {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    categoryId: string;

    @Column()
    companyId: string;

    @Column()
    employeeId: string;

    @Column({nullable:true})
    reason:string;

    @Column({nullable:true})
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}