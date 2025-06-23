import { EducationDto } from './education.dto';
import { EmailDto } from './email.dto';
import { FullNameDto } from './fullName.dto';
import { PermanentAddressDto } from './permanentAddress.dto';
import { PhoneDto } from './phone.dto';
import { SocialDto } from './social.dto';
import { TemporaryAddressDto } from './temporyAddress.dto';

export class EmployeeDto {
  employeeId: string;

  username: string;

  password: string;

  employeeNo: number;

  access: boolean;

  status: string;

  birthday: string;

  gender: string;

  maritalStatus: string;

  passportNumber: string;

  taxfileNumber: string;

  nin: string;

  hireDate: string;

  ethnicity: string;

  eeoCategory: string;

  shirtSize: string;

  allergies: string;

  dietaryRestric: string;

  secobdaryLang: string;

  createdAt: Date;

  modifiedAt: Date;

  preferedName: string;

  profileImage: string;

  vaccinated: boolean;

  doses: number;

  reason: string;
}
