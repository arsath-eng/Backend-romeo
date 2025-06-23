import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { max } from 'date-fns';
import { PermanentAddress } from '../allDtos/subDtos/permanentAddress.dto';
import { Phone } from '../allDtos/subDtos/phone.dto';
import { TemporaryAddress } from '../allDtos/subDtos/temporaryAddress.dto';
import { attendanceSettings, payrollEmploymentDto } from '@flows/allDtos/payrollEmployment.dto';
import { tr } from 'date-fns/locale';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

@Entity()
export class HrmEmployeeDetails {
  @PrimaryGeneratedColumn('uuid', {name: 'employeeId'})
  employeeId: string;

  @Column('uuid')
  userId: string;

  @Column({nullable:true})
  timezone: string;

  @Column({nullable:true})
  getStarted: boolean;

  @Column({
    nullable: true,
  })
  employeeNo: number;

  @Column()
  access: boolean;

  @Column()
  status: string;

  @Column({
    nullable: true,
  })
  birthday: string;

  @Column({
    nullable: true,
  })
  gender: string;

  @Column({
    nullable: true,
  })
  maritalStatus: string;

  @Column({
    nullable: true,
  })
  passportNumber: string;

  @Column({
    nullable: true,
  })
  taxfileNumber: string;

  @Column({
    nullable: true,
  })
  nin: string;

  @Column({
    nullable: true,
  })
  vaccinated: boolean;

  @Column({
    nullable: true,
  })
  doses: number;

  @Column({
    nullable: true,
  })
  reason: string;

  @Column({
    nullable: true,
  })
  owner: boolean;

  @Column({
    nullable: true,
  })
  hireDate: string;

  @Column({
    nullable: true,
  })
  terminationDate: string;

  @Column({
    nullable: true,
  })
  ethnicity: string;

  @Column({
    nullable: true,
  })
  eeoCategory: string;

  @Column({
    nullable: true,
  })
  shirtSize: string;

  @Column({
    nullable: true,
  })
  allergies: string;

  @Column({
    nullable: true,
  })
  dietaryRestric: string;

  @Column({
    nullable: true,
  })
  secondaryLang: string;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column({
    nullable: true,
  })
  preferedName: string;

  @Column({nullable: true})
  online: boolean;

  @Column({nullable: true,type: "varchar"})
  profileImage;

  @Column({type: 'json', nullable:true})
  email: {
    work: string;
    personal: string;
  };

  @Column({type: 'json', nullable:true})
  fullName: {
    first: string;
    middle: string;
    last: string;
  };

  @Column({type: 'json', nullable:true})
  permanentAddress: PermanentAddress;

  @Column({type: 'json', nullable:true})
  phone: Phone;

  @Column({type: 'json', nullable:true})
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    pinterest: string;
  };

  @Column({type: 'json', nullable:true})
  temporaryAddress: TemporaryAddress;

  @Column()
  companyId: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  jobInformation:  {
    id: string;
    employeeId: string;
    effectiveDate: Date;
    jobTitle: string;
    location: string;
    department: string;
    division: string;
    active: boolean;
    reportTo: {
      employeeId: string;
      reporterId: string;
      reporterName: string;
    };
    createdAt: Date;
    modifiedAt: Date;
    companyId: string;
  }[];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  employeeStatus;

  @Column('uuid')
  accessLevelId;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  emergencyContacts

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  education;

  @Column({type: 'json', nullable:true})
  approvals;

  @Column({type: 'json', nullable:true})
  reportAccessLevels;

  @Column({nullable: true})
  lastLogin: Date;

  @Column({type: 'json', nullable:true})
  payrollEmployment: payrollEmploymentDto;

  @Column({type: 'json', default: {
    "workPlace": "",
    "officeLocation": "",
    "remoteLocation": "",
    "geoLocation": " , ",
    "checkGeoLocation":false,
    "workingDays": [
      {
        "id": 1,
        "day": "Monday",
        "start": "08:00 AM",
        "end": "05:30 PM",
        "flexible": false,
        "isWorkingDay": true
      },
      {
        "id": 2,
        "day": "Tuesday",
        "start": "08:00 AM",
        "end": "05:30 PM",
        "flexible": false,
        "isWorkingDay": true
      },
      {
        "id": 3,
        "day": "Wednesday",
        "start": "08:00 AM",
        "end": "05:30 PM",
        "flexible": false,
        "isWorkingDay": true
      },
      {
        "id": 4,
        "day": "Thursday",
        "start": "08:00 AM",
        "end": "05:30 PM",
        "flexible": false,
        "isWorkingDay": true
      },
      {
        "id": 5,
        "day": "Friday",
        "start": "08:00 AM",
        "end": "05:30 PM",
        "flexible": false,
        "isWorkingDay": true
      },
      {
        "id": 6,
        "day": "Saturday",
        "start": "08:00 AM",
        "end": "05:30 PM",
        "flexible": false,
        "isWorkingDay": false
      },
      {
        "id": 0,
        "day": "Sunday",
        "start": "08:00 AM",
        "end": "05:30 PM",
        "flexible": false,
        "isWorkingDay": false
      }
    ]
  }})
  attendanceSettings: attendanceSettings;

  @Column({default: false})
  whatsappVerify: boolean;

  @Column({
    default:'40'
  })
  weeklyHourLimit: string;

  @Column({
    default:'744'
  })
  monthlyHourLimit: string;

  @Column({default: ''})
  nationality: string;

  @Column('jsonb',{default: {visaStatus: '',visaCategory:'', brbNumber: '', expireDate: '',visaDescription: '',visaConditions: ''}})
  visaDetails: {
    visaStatus: string;
    visaCategory: string;
    brbNumber: string;
    expireDate: string;
    visaDescription: string;
    visaConditions: string;
  }

  @Column('jsonb', {default: {studentLoanDetails: '', pensionDetails: ''}})
  customFields:{
      studentLoanDetails: string;
      pensionDetails: string;
    }

  @Column('jsonb',{default: {
    tfn: "",
    tfnUpdateDate: "",
    tfnExemption: "",
    residencyStatus: "",
    countryCode: "",
    isRegisteredWHM: false,
    typeOfPayee: "",
    stsl: false,
    taxFreeThreshold: false,
    applyOtherTaxOffset:false,
    applyOtherTaxOffsetValue:"",
    applyWithheldIncreased: false,
    applyWithheldIncreasedValue:"",
    eligibleForLeaveLoading:false,
    applySgcOnLeaveLoading: false,
    hasApprovedWithholdingVariation:false,
    incomeType: false,
    isClaimMediExemption: false,
    isClaimMediReduction:false,
    dependentChildrenClaimedNo: "",
    isCombinedIncome: false
  } })
  taxDeclaration:{
    tfn: string;
    tfnUpdateDate: string,
    tfnExemption: string;
    residencyStatus: string;
    countryCode: string;
    isRegisteredWHM: boolean;
    typeOfPayee: string;
    stsl: boolean;
    taxFreeThreshold: boolean;
    applyOtherTaxOffset: boolean;
    applyOtherTaxOffsetValue: string;
    applyWithheldIncreased: boolean;
    applyWithheldIncreasedValue: string;
    eligibleForLeaveLoading:boolean;
    applySgcOnLeaveLoading: boolean;
    hasApprovedWithholdingVariation:boolean;
    incomeType: boolean;
    isClaimMediExemption: boolean;
    isClaimMediReduction: boolean;
    dependentChildrenClaimedNo: string;
    isCombinedIncome: boolean;
  }
  @Column({default: false})
  dummy: boolean;

  @Column()
  payrollId: string;

  @BeforeInsert()
  setPayrollId() {
    if (!this.payrollId) {
      this.payrollId = this.employeeId;
    }
  }

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  licences;
}
