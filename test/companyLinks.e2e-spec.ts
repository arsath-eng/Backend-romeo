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
import { CompanyLinksModule } from '../src/companyLinks/module/companyLinks.module';
import { CompanyLinksCategories } from '../src/companyLinks/entities/companyLinksCategories.entity';
import { CompanyLinks } from '../src/companyLinks/entities/companyLinks.entity';
const globalPrefix = 'app/v1';

describe('ClaimsController (e2e)', () => {
  let app: INestApplication;
  let claimsDto = {
    id: "",
    employeeId: "",
    claimDate: "",
    claimCategory: "",
    claimComment: "",
    fileId: "",
    fileLink: "",
    comment: "",
    action: "",
    paidBy: "",
    status: "",
    amount: "",
    createdAt: new Date(),
    modifiedAt: new Date(),
    companyId: "",
  }
  let companyLinksCategoriesDto = {}
  let companyLinksDto = {}
  let employeeDto = { 
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
  const mockCompanyLinksCategories = {
    findOne:jest.fn().mockResolvedValue(companyLinksCategoriesDto),
    find:jest.fn().mockResolvedValue([companyLinksCategoriesDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    findOneOrFail:jest.fn().mockResolvedValue({}),
    remove:jest.fn().mockResolvedValue({}),
  }
  const mockCompanyLinks = {
    findOne:jest.fn().mockResolvedValue(companyLinksDto),
    find:jest.fn().mockResolvedValue([companyLinksDto]),
    create:jest.fn().mockResolvedValue({}),
    save:jest.fn().mockResolvedValue({}),
    remove:jest.fn().mockResolvedValue({}),
    findOneOrFail:jest.fn().mockResolvedValue({companyLinksDto}),
  }
  const mockAuthGuard = {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CompanyLinksModule],
    }).overrideProvider(getRepositoryToken(CompanyLinksCategories)).useValue(mockCompanyLinksCategories)
      .overrideProvider(getRepositoryToken(CompanyLinks)).useValue(mockCompanyLinks)
      .overrideProvider(getRepositoryToken(Employee)).useValue(employeeDto)
      .overrideGuard(AuthGuard('JWT')).useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`/:companyId/company-links/categories (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/company-links/categories')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/:companyId/company-links/categories (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/company-links/categories')
      .expect(200)
  });
  it(`/company-links/categories/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/company-links/categories/:id')
      .expect(200)
  });
  it(`/company-links/categories/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/company-links/categories/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/company-links/categories/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/company-links/categories/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/:companyId/company-links/links (GET)`, () => {
    return request(app.getHttpServer())
      .get('/:companyId/company-links/links')
      .expect(200)
  });
  it(`/:companyId/company-links/links (POST)`, () => {
    return request(app.getHttpServer())
      .post('/:companyId/company-links/links')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/company-links/links/:id (GET)`, () => {
    return request(app.getHttpServer())
      .get('/company-links/links/:id')
      .expect(200)
  });
  it(`/company-links/links/:id (PUT)`, () => {
    return request(app.getHttpServer())
      .put('/company-links/links/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
  it(`/company-links/links/:id (DELETE)`, () => {
    return request(app.getHttpServer())
      .delete('/company-links/links/:id')
      .expect(200)
      .expect({statusCode: 200,description: 'success'})
  });
});
