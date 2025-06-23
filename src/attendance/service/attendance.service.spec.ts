import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { attendance } from '../entities/attendance.entity';
import { Repository } from 'typeorm';
import { APIModule } from '../../superAdminPortalAPI/APIservice.module';
import { EmployeeService } from '..//employee/service/employee.service';
import { Employee } from '..//employee/entities/employee.entity';

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;
  let attendanceRepository: Repository<attendance>;
  let attendanceToken = getRepositoryToken(attendance);

  let employeeService: EmployeeService;
  let employeeRepository: Repository<Employee>;
  let employeeToken = getRepositoryToken(Employee);



  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceService, EmployeeService,
      {
        provide: attendanceToken,
        useValue: {
          create: jest.fn(),
          save: jest.fn(),
          findOne: jest.fn(),
        }
      },
      {
        provide: employeeToken,
        useValue: {
          create: jest.fn(),
          save: jest.fn(),
          findOne: jest.fn(),
        }
      }],
      imports: [APIModule]
    }).compile();

    attendanceService = module.get<AttendanceService>(AttendanceService);
    attendanceRepository = module.get<Repository<attendance>>(attendanceToken);

    employeeService = module.get<EmployeeService>(EmployeeService);
    employeeRepository = module.get<Repository<Employee>>(employeeToken);

    employeeService = module.get<EmployeeService>(EmployeeService);
    employeeRepository = module.get<Repository<Employee>>(employeeToken);
  });

  it('should be defined', () => {
    expect(attendanceService).toBeDefined();
  });
});
