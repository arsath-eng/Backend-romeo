import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class hrletterTemplate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    
    @Column()
    categoryId: string;

    @Column({ default: true })
    isActive: boolean;

    
    @Column({ default: true })
    isDefault: boolean;

    @Column()
    companyId: string;

    @Column({ type: 'json', nullable: true })
    content: { page: string; content: string }[];

    @Column("text", { array: true, nullable: true })
    tags: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}