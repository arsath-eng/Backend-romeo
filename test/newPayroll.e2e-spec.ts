import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { AdjustTimeOffBalance } from '../src/adjustTimeOffBalance/entities/adjustTimeOffBalance.entity';
import { AdjustTimeOffBalanceModule } from '../src/adjustTimeOffBalance/module/adjustTimeOffBalance.module';
import { TimeOffInformation } from '../src/timeOffInformation/entities/timeOffInformation.entity';
import { TimeOffRequestNotificationData } from '../src/notifications/entities/timeOffRequestNotificationData.entity';
import { RemoveNoPay } from '../src/notifications/entities/removeNoPay.entity';
import { AddNoPay } from '../src/notifications/entities/addNoPay.entity';
import { Documents } from '../src/documents/entities/documents.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { Employee } from '../src/employee/entities/employee.entity';
import { TimezoneService } from '../src/timezone/timezone.service';
import { AccuralLevels } from '../src/accuralLevels/entities/accuralLevels.entity';
import { TimeOffPolicies } from '../src/settingsTimeOffTimeOffPolicies/entities/TimeOffPolicies.entity';
import { TimeOffCategory } from '../src/timeOffCategory/entities/timeOffCategory.entity';
import { payrollAdvancedAccountDto } from '@flows/new-payroll/dto/payrollAdvancedAccount.dto';
import { payrollBankAccountDto } from '@flows/new-payroll/dto/payrollBankAccount.dto';
import { payrollSuperannuationDto } from '@flows/new-payroll/dto/payrollSuperannuation.dto';
import { payrollDeductionDto } from '@flows/new-payroll/dto/payrollDeduction.dto';
import { payrollEarningsDto } from '@flows/new-payroll/dto/payrollEarnings.dto';
import { payrollEmploymentDto } from '@flows/new-payroll/dto/payrollEmployment.dto';
import { payrollNotesDto } from '@flows/new-payroll/dto/payrollNotes.dto';
import { payrollOpeningBalanceDto } from '@flows/new-payroll/dto/payrollOpeningBalance.dto';
import { payrollPaySlipDto } from '@flows/new-payroll/dto/payrollPaySlip.dto';
import { payrollPayTemplateDto } from '@flows/new-payroll/dto/payrollPayTemplate.dto';
import { payrollReimbursementDto } from '@flows/new-payroll/dto/payrollReimbursement.dto';
import { payrollAdvancedAccount } from '@flows/new-payroll/entities/payrollAdvancedAccount.entity';
const globalPrefix = 'app/v1';

describe('AdjustTimeoffBalanceController (e2e)', () => {
  let app: INestApplication;

  const mockPayrollAdvancedAccount = {
    findOne:jest.fn().mockResolvedValue(payrollAdvancedAccountDto),
    find:jest.fn().mockResolvedValue([payrollAdvancedAccountDto]),
    create:jest.fn().mockResolvedValue(payrollAdvancedAccountDto),
    save:jest.fn().mockResolvedValue(payrollAdvancedAccountDto),
  }
  const mockPayrollBankAccount = {
    findOne:jest.fn().mockResolvedValue(payrollBankAccountDto),
    find:jest.fn().mockResolvedValue([payrollBankAccountDto]),
    create:jest.fn().mockResolvedValue(payrollBankAccountDto),
    save:jest.fn().mockResolvedValue(payrollBankAccountDto),
  }
  const mockPayrollDeduction = {
    findOne:jest.fn().mockResolvedValue(payrollDeductionDto),
    find:jest.fn().mockResolvedValue([payrollDeductionDto]),
    create:jest.fn().mockResolvedValue(payrollDeductionDto),
    save:jest.fn().mockResolvedValue(payrollDeductionDto),
  }
  const mockPayrollEarnings = {
    findOne:jest.fn().mockResolvedValue(payrollEarningsDto),
    find:jest.fn().mockResolvedValue([payrollEarningsDto]),
    create:jest.fn().mockResolvedValue(payrollEarningsDto),
    save:jest.fn().mockResolvedValue(payrollEarningsDto),
  }
  const mockPayrollEmploymentAccount = {
    findOne:jest.fn().mockResolvedValue(payrollEmploymentDto),
    find:jest.fn().mockResolvedValue([payrollEmploymentDto]),
    create:jest.fn().mockResolvedValue(payrollEmploymentDto),
    save:jest.fn().mockResolvedValue(payrollEmploymentDto),
  }
  const mockPayrollNotes = {
    findOne:jest.fn().mockResolvedValue(payrollNotesDto),
    find:jest.fn().mockResolvedValue([payrollNotesDto]),
    create:jest.fn().mockResolvedValue(payrollNotesDto),
    save:jest.fn().mockResolvedValue(payrollNotesDto),
  }
  const mockPayrollOpeningBalance = {
    findOne:jest.fn().mockResolvedValue(payrollOpeningBalanceDto),
    find:jest.fn().mockResolvedValue([payrollOpeningBalanceDto]),
    create:jest.fn().mockResolvedValue(payrollOpeningBalanceDto),
    save:jest.fn().mockResolvedValue(payrollOpeningBalanceDto),
  }
  const mockPayrollPaySlip = {
    findOne:jest.fn().mockResolvedValue(payrollPaySlipDto),
    find:jest.fn().mockResolvedValue([payrollPaySlipDto]),
    create:jest.fn().mockResolvedValue(payrollPaySlipDto),
    save:jest.fn().mockResolvedValue(payrollPaySlipDto),
  }
  const mockPayrollPayTemplate = {
    findOne:jest.fn().mockResolvedValue(payrollPayTemplateDto),
    find:jest.fn().mockResolvedValue([payrollPayTemplateDto]),
    create:jest.fn().mockResolvedValue(payrollPayTemplateDto),
    save:jest.fn().mockResolvedValue(payrollPayTemplateDto),
  }
  const mockPayrollReimbursement = {
    findOne:jest.fn().mockResolvedValue(payrollReimbursementDto),
    find:jest.fn().mockResolvedValue([payrollReimbursementDto]),
    create:jest.fn().mockResolvedValue(payrollReimbursementDto),
    save:jest.fn().mockResolvedValue(payrollReimbursementDto),
  }
  const mockPayrollSuperannuation = {
    findOne:jest.fn().mockResolvedValue(payrollSuperannuationDto),
    find:jest.fn().mockResolvedValue([payrollSuperannuationDto]),
    create:jest.fn().mockResolvedValue(payrollSuperannuationDto),
    save:jest.fn().mockResolvedValue(payrollSuperannuationDto),
  }

  const mockTimezoneService = {
    dateMatches:jest.fn().mockResolvedValue(false),
  }
  const mockAuthGuard = {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdjustTimeOffBalanceModule],
    }).overrideProvider(getRepositoryToken(payrollAdvancedAccount)).useValue(mockPayrollAdvancedAccount)
    .overrideProvider(getRepositoryToken(payrollBankAccount)).useValue(mockPayrollBankAccount)
    .overrideProvider(getRepositoryToken(payrollPayrollDeduction)).useValue(mockPayrollDeduction)
    .overrideProvider(getRepositoryToken(payrollPayrollEarnings)).useValue(mockPayrollEarnings)
    .overrideProvider(getRepositoryToken(payrollEmploymentAccount)).useValue(mockPayrollEmploymentAccount)
    .overrideProvider(getRepositoryToken(payroll)).useValue(mockPayrollNotes)
    .overrideProvider(getRepositoryToken(payroll)).useValue(mockPayrollOpeningBalance)
    .overrideProvider(getRepositoryToken(payroll)).useValue(mockPayrollPaySlip)
    .overrideProvider(getRepositoryToken(payroll)).useValue(mockPayrollPayTemplate)
    .overrideProvider(getRepositoryToken(payroll)).useValue(mockPayrollReimbursement)
    .overrideProvider(getRepositoryToken(payroll)).useValue(mockPayrollSuperannuation)
      .overrideGuard(AuthGuard('JWT')).useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/adjust-balances/ (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/adjust-balances')
      .expect(200)
  });
  it(`/:companyId/adjust-balances (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/adjust-balances')
      .expect(200)
  });
  it(`/adjust-balances/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/adjust-balances/:id')
      .expect(200)
  });
  it(`/adjust-balances/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/adjust-balances/:id')
      .expect(200)
  });
});
