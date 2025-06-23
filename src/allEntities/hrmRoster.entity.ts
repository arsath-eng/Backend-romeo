import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class HrmRosterEmployees {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column('uuid')
    employeeId: string;
  
    @Column({
      type: 'jsonb',
      array: false,
      default: () => "'[]'",
      nullable: true,
    })
    sites;

    @Column({
      type: 'jsonb',
      array: false,
      default: () => "'[]'",
      nullable: true,
    })
    positions;

    @Column({default:true})
    active: boolean;
  
    @Column()
    companyId: string;
  
    @CreateDateColumn()
    createdAt: string;
  
    @UpdateDateColumn()
    updatedAt: string;
  }

  @Entity()
  export class HrmRosterSites {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;

    @Column()
    siteId: string;

    @Column()
    phone: string;

    @Column('jsonb')
    address: {
      street: string,
      city: string,
      state: string,
      country: string,
      postCode: string
    }

    @Column({default:true})
    active: boolean;
  
    @Column()
    companyId: string;
  
    @CreateDateColumn()
    createdAt: string;
  
    @UpdateDateColumn()
    updatedAt: string;

    @Column('jsonb', { default: () => "'[]'" })
    breaks: { 
      startTime: string,
      endTime: string
    }[];

  }

  @Entity()
  export class HrmRosterPositions {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;

    @Column()
    positionId: string;


    @Column()
    description: string;  


    @Column({default:true})
    active: boolean;

    @Column()
    companyId: string;
  
    @CreateDateColumn()
    createdAt: string;
  
    @UpdateDateColumn()
    updatedAt: string;
  }

  @Entity()
  export class HrmRosterShifts {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    date: string;

    @Column('jsonb')
    site:{
      siteId: string,
      siteName: string
    }

    @Column('jsonb')
    position:{
      positionId: string,
      positionName: string
    }


    @Column()
    startTime: string; 

    @Column()
    endTime: string;  

    @Column('uuid')
    employeeId: string;

    @Column()
    color: string;

    @Column()
    notes: string;

    @Column({default: false})
    allDay: boolean;

    @Column({default:true})
    active: boolean;

    @Column({default:false})
    isOvertime: boolean;

    @Column()
    companyId: string;
  
    @CreateDateColumn()
    createdAt: string;
  
    @UpdateDateColumn()
    updatedAt: string;

    @Column({default: false})
    isOpen:boolean

    @Column('jsonb', { default: () => "'[]'" })
    breaks: { 
      startTime: string,
      endTime: string 
    }[];
  }

  @Entity()
  export class HrmRosterTemplates {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;

    @Column()
    description: string;

    @Column('jsonb')
    shifts: string[];

    @Column({default:true})
    active: boolean;

    @Column()
    companyId: string;
  
    @CreateDateColumn()
    createdAt: string;
  
    @UpdateDateColumn()
    updatedAt: string;
  }
  
  