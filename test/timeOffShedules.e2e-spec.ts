import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TrainingCompleteModule } from '../src/trainingComplete/module/trainingComplete.module';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimeOffSchedules } from '../src/timeOffShedules/entities/timeOffShedules.entity';
import { TimeOffSchedulesDates } from '../src/timeOffShedules/entities/timeOffShedulesDates.entity';
import { TimeOffSchedulesNotes } from '../src/timeOffShedules/entities/timeOffShedulesNotes.entity';
import { TimeOffSchedulesModule } from '../src/timeOffShedules/module/timeOffShedules.module';
import { Employee } from '../src/employee/entities/employee.entity';
import { TimeOffSchedulesDto } from '../src/timeOffShedules/dto/timeOffShedules.dto';

describe('TimeOffShedules (e2e) ', () => {
  let app: INestApplication;

  const mockAuthGuard = {};
  const mockTimeOffShedulesDto = {
    id: 1,
    employeeId: '1',
    employeeName: '',
    dateFrom: '2023-06-06',
    dateTo: '2023-06-07',
    timeoffCategoryId: '',
    timeoffCategoryName: '',
    amount: 0,
    createdAt: '2023-06-06',
    modifiedAt: '2023-06-06',
    companyId: 1,
    note: [],
    dates: [],
  };

  const mocktimeOffSchedulesRepository = {
    create: jest.fn().mockReturnValue(mockTimeOffShedulesDto),
    save: jest.fn().mockResolvedValue(mockTimeOffShedulesDto),
    find: jest.fn().mockResolvedValue([mockTimeOffShedulesDto]),
    findOneOrFail: jest.fn().mockResolvedValue(mockTimeOffShedulesDto),
    remove: jest.fn().mockResolvedValue(mockTimeOffShedulesDto),
  };
  const mocktimeOffSchedulesDatesRepository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  };
  const mocktimeOffSchedulesNotesRepository = {
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  };

  const mockEmployeeRepository = {
    find: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TimeOffSchedulesModule],
    })
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(TimeOffSchedules))
      .useValue(mocktimeOffSchedulesRepository)
      .overrideProvider(getRepositoryToken(TimeOffSchedulesDates))
      .useValue(mocktimeOffSchedulesDatesRepository)
      .overrideProvider(getRepositoryToken(TimeOffSchedulesNotes))
      .useValue(mocktimeOffSchedulesNotesRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/timeoff-schedules (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/timeoff-schedules')
      .send(mockTimeOffShedulesDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('timeoff-schedules/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/timeoff-schedules/1')
      .expect(200)
      .expect([mockTimeOffShedulesDto]);
  });

  it('timeoff-schedules/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/timeoff-schedules/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

});
