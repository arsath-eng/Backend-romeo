import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Not, Repository } from 'typeorm';

@Injectable()
export class CelebrationsService {
  constructor(
    @InjectRepository(HrmEmployeeDetails)
    private employeeRepository: Repository<HrmEmployeeDetails>,
  ) {}

  async getCelebrations(companyId: string) {
    try {
      const employees = await this.employeeRepository.find({
        where: { companyId: companyId, status: Not('Non Active') },
      });
      const celebrations = [];
      const date = new Date(format(new Date(), 'yyyy-MM-dd'));
      for (let i = 0; i < employees.length; i++) {
        const json = {};
        const birthDate = new Date(employees[i].birthday);
        json['employeeId'] = employees[i].employeeId;
        json['name'] =
          employees[i].fullName.first + ' ' + employees[i].fullName.last;

        if (employees[i].birthday === null || employees[i].birthday === '') {
          json['date'] = '';
        }

        if (
          birthDate.getMonth() < date.getMonth() ||
          (birthDate.getMonth() === date.getMonth() &&
            birthDate.getDate() < date.getDate())
        ) {
          birthDate.setFullYear(date.getFullYear() + 1);
          json['date'] = birthDate.toISOString().slice(0, 10);
        } else if (
          birthDate.getMonth() > date.getMonth() ||
          (birthDate.getMonth() === date.getMonth() &&
            birthDate.getDate() > date.getDate()) ||
          (birthDate.getMonth() === date.getMonth() &&
            birthDate.getDate() === date.getDate())
        ) {
          birthDate.setFullYear(date.getFullYear());
          json['date'] = birthDate.toISOString().slice(0, 10);
        }
        json['type'] = 'BIRTHDAY';
        json['profilePhoto'] = employees[i].profileImage;
        if (json['date'] !== '') {
          celebrations.push(json);
        }
      }

      for (let i = 0; i < employees.length; i++) {
        const json = {};
        if (
          employees[i].hireDate != null ||
          employees[i].hireDate != '' ||
          new Date(employees[i].hireDate) < date
        ) {
          const hireDate = new Date(employees[i].hireDate);
          json['aniversary'] = date.getFullYear() - hireDate.getFullYear();
          hireDate.setFullYear(date.getFullYear());
          json['date'] = format(hireDate, 'yyyy-MM-dd');
          json['employeeId'] = employees[i].employeeId;
          json['name'] =
            employees[i].fullName.first + ' ' + employees[i].fullName.last;
          json['type'] = 'ANNIVERSARY';
          json['profilePhoto'] = employees[i].profileImage;

          if (json['aniversary'] > 0) {
            celebrations.push(json);
          }
        }
      }
      celebrations.sort((a, b) => {
        return a.date - b.date;
      });
      const Filter = [];
      for (let i = 0; i < celebrations.length; i++) {
        if (celebrations[i].date === undefined) {
        } else {
          Filter.push(celebrations[i]);
        }
      }
      return Filter;
    } catch (error) {
      console.log('GET_CELEBRATIONS', error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
