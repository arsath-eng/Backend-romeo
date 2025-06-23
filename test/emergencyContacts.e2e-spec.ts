import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportTo } from '../src/jobInformation/entities/reportTo.entity';
import { Notifications } from '../src/notifications/entities/notificationRequest.entity';
import { Documents } from '../src/documents/entities/documents.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { JwtStrategy } from '../src/auth/strategy/jwt.strategy';
import { claims } from '../src/claims/claims.entity';
import { ClaimsModule } from '../src/claims/claims.module';
import { Employee } from '../src/employee/entities/employee.entity';
import { CustomerSupportModule } from '../src/customer-support/module/customer-support.module';
import { customerSupport } from '../src/customer-support/entities/customerSupport.entity';
import { EmergencyContactsModule } from '../src/emergencyContacts/module/emergencyContacts.module';
import { EmergencyAddress } from '../src/emergencyContacts/entities/emergencyAddress.entity';
import { EmergencyContacts } from '../src/emergencyContacts/entities/emergencyContacts.entity';
import { EmergencyEmail } from '../src/emergencyContacts/entities/emergencyEmail.entity';
import { EmergencyPhone } from '../src/emergencyContacts/entities/emergencyPhone.entity';
import { stringify } from 'querystring';
import { json } from 'stream/consumers';
const globalPrefix = 'app/v1';

describe('EmergencyContactsController (e2e)', () => {
  let app: INestApplication;
  let employeeDto = { 
    fullName: {
      first:"",
      last:""
    },
    employeeId: '',
    timezone: '',
    username: '',
    password: '',
    getStarted: '',
    emailVerified: '',
    employeeNo: 1,
    access: true,
    status: '',
    birthday: '',
    gender: '',
    maritalStatus: '',
    passportNumber: '',
    taxfileNumber: '',
    nin: '',
    vaccinated: true,
    doses: 1,
    reason: '',
    owner: true,
    hireDate: '',
    terminationDate: '',
    ethnicity: '',
    eeoCategory: '',
    shirtSize: '',
    allergies: '',
    dietaryRestric: '',
    secondaryLang: '',
    createdAt: new Date(),
    modifiedAt: new Date(),
    preferedName: '',
    online: false,
    profileImage: '',
  }
  let EmergencyEmailDto = {
    id: "",
    email: "",
  }
  let EmergencyAddressDto = {
    id: "",
    no: "",
    street: "",
    city: "",
    state: "",
    zip: 11111,
    country: "",
  }
  let EmergencyPhoneDto = {
    id: "",
    work:1234,
    mobile:1234,
    home:1234,
  }
  let EmergencyContactsDto = {
    id: "",
    employeeId: "",
    name: "",
    relationship: "",
    primary: false,
    createdAt: "",
    modifiedAt: "",
    companyId: "",
    email: EmergencyEmailDto,
    address: EmergencyAddressDto,
    phone: EmergencyPhoneDto,
  }
  let getEmergencyContactsDto = {
    contacts: [EmergencyContactsDto],
    employeeId: "",
  }
  let getEmergencyContactsByIdDto = {
    contacts: [EmergencyContactsDto],
    employeeId: ":id",
  }

  const mockEmployee = {
    findOne:jest.fn().mockResolvedValue(employeeDto),
    find:jest.fn().mockResolvedValue([employeeDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockEmergencyContacts = {
    findOne:jest.fn().mockResolvedValue(EmergencyContactsDto),
    find:jest.fn().mockResolvedValue([EmergencyContactsDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    findOneOrFail:jest.fn().mockResolvedValue(EmergencyContactsDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockEmergencyEmail = {
    findOne:jest.fn().mockResolvedValue(EmergencyEmailDto),
    find:jest.fn().mockResolvedValue([EmergencyEmailDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    findOneOrFail:jest.fn().mockResolvedValue(EmergencyEmailDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockEmergencyAddress = {
    findOne:jest.fn().mockResolvedValue(EmergencyAddressDto),
    find:jest.fn().mockResolvedValue([EmergencyAddressDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    findOneOrFail:jest.fn().mockResolvedValue(EmergencyAddressDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockEmergencyPhone = {
    findOne:jest.fn().mockResolvedValue(EmergencyPhoneDto),
    find:jest.fn().mockResolvedValue([EmergencyPhoneDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    findOneOrFail:jest.fn().mockResolvedValue(EmergencyPhoneDto),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockAuthGuard = {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EmergencyContactsModule],
    })
      .overrideProvider(getRepositoryToken(EmergencyContacts)).useValue(mockEmergencyContacts)
      .overrideProvider(getRepositoryToken(EmergencyEmail)).useValue(mockEmergencyEmail)
      .overrideProvider(getRepositoryToken(EmergencyAddress)).useValue(mockEmergencyAddress)
      .overrideProvider(getRepositoryToken(EmergencyPhone)).useValue(mockEmergencyPhone)
      .overrideProvider(getRepositoryToken(Employee)).useValue(mockEmployee)
      .overrideGuard(AuthGuard('JWT')).useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/emergency-contacts (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/emergency-contacts')
      .send({
        "contacts": [],
      })
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/:companyId/emergency-contacts (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/emergency-contacts')
      .expect(200)
      .expect([getEmergencyContactsDto])
  });
  it(`/emergency-contacts/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/emergency-contacts/:id')
      .send({
        "contacts": [],
      })
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/emergency-contacts/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/emergency-contacts/:id')
      .expect(200)
      .expect(JSON.stringify(getEmergencyContactsByIdDto))
  });
  it(`/emergency-contacts/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/emergency-contacts/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
});
