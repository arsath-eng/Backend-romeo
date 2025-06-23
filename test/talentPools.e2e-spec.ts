import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TalentPoolsModule } from '../src/talentPools/module/talentPools.module';
import { TalentPools } from '../src/talentPools/entities/talentPools.entity';
import { TalentPoolsCandidates } from '../src/talentPools/entities/talentPoolsCandidates.entity';
import { TalentPoolsCollaborators } from '../src/talentPools/entities/talentPoolsCollabarators.entity';
import { TalentPoolsCollaboratorsMain } from '../src/talentPools/entities/talentPoolsCollabaratorsMain.entity';
import { JobInformation } from '../src/jobInformation/entities/jobInformation.entity';
import { Employee } from '../src/employee/entities/employee.entity';
import { Documents } from '../src/documents/entities/documents.entity';
import { Folders } from '../src/documents/entities/documentsFolders.entity';
import { NotificationRequest } from '../src/notifications/entities/notificationRequest.entity';

describe('TalentPools (e2e) ', () => {
  let app: INestApplication;
  const mockAuthGuard = {};

  const mockTalentPoolsDto = {
    name: '',
    description: '',
    createdAt: '2023-06-06',
    modifiedAt: '2023-06-06',
    companyId: 1,
  };
  const mockTalentPoolsCandidatesDto = {
    cadidateId: 1,
    talentPoolId: 1,
    createdAt: '2023-06-06',
    modifiedAt: '2023-06-06',
  };
  const mockTalentPoolsCollaboratorsDto = {
    collaborators: [],
  };
  const mockTalentPoolsCollaboratorsMainDto = {};
  const mockJobInformationDto = {};
  const mockEmployeeDto = {
    fullName: {
      first: '',
      last: '',
    },
  };
  const mockDocumentsDto = {};
  const mockFoldersDto = {};
  const mockNotificationRequestDto = {};

  const mockTalentPoolsRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue(mockTalentPoolsDto),
    findOne: jest.fn().mockResolvedValue(mockTalentPoolsDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockTalentPoolsCandidatesRepository = {
    remove: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue(mockTalentPoolsCandidatesDto),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue(mockTalentPoolsCandidatesDto),
    create: jest.fn().mockResolvedValue({}),
  };
  const mockTalentPoolsCollaboratorsRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockTalentPoolsCollaboratorsMainRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockJobInformationRepository = {
    findOne: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {
    findOne: jest.fn().mockResolvedValue(mockEmployeeDto),
  };
  const mockDocumentsRepository = {};
  const mockFoldersRepository = {};
  const mockNotificationRequestRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TalentPoolsModule],
    })
      .overrideProvider(getRepositoryToken(TalentPools))
      .useValue(mockTalentPoolsRepository)
      .overrideProvider(getRepositoryToken(TalentPoolsCandidates))
      .useValue(mockTalentPoolsCandidatesRepository)
      .overrideProvider(getRepositoryToken(TalentPoolsCollaborators))
      .useValue(mockTalentPoolsCollaboratorsRepository)
      .overrideProvider(getRepositoryToken(TalentPoolsCollaboratorsMain))
      .useValue(mockTalentPoolsCollaboratorsMainRepository)
      .overrideProvider(getRepositoryToken(JobInformation))
      .useValue(mockJobInformationRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideProvider(getRepositoryToken(Documents))
      .useValue(mockDocumentsRepository)
      .overrideProvider(getRepositoryToken(Folders))
      .useValue(mockFoldersRepository)
      .overrideProvider(getRepositoryToken(NotificationRequest))
      .useValue(mockNotificationRequestRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/hiring/talent-pools (POST) ', () => {
    return request(app.getHttpServer())
      .post('/1/hiring/talent-pools')
      .send(mockTalentPoolsDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/hiring/talent-pools (GET) ', () => {
    return request(app.getHttpServer())
      .get('/1/hiring/talent-pools')
      .expect(200)
      .expect(mockTalentPoolsDto);
  });

  it('hiring/talent-pools/:id (GET) ', () => {
    return request(app.getHttpServer())
      .get('/hiring/talent-pools/1')
      .expect(200)
      .expect(mockTalentPoolsDto);
  });

  it('hiring/talent-pools/:id (PUT) ', () => {
    return request(app.getHttpServer())
      .put('/hiring/talent-pools/1')
      .send(mockTalentPoolsDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('hiring/talent-pools/:id (DELETE) ', () => {
    return request(app.getHttpServer())
      .delete('/hiring/talent-pools/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/hiring/talent-pools/candidates (POST) ', () => {
    return request(app.getHttpServer())
      .post('/1/hiring/talent-pools/candidates')
      .send(mockTalentPoolsCandidatesDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/hiring/talent-pools/:id/candidates (GET) ', () => {
    return request(app.getHttpServer())
      .get('/1/hiring/talent-pools/1/candidates')
      .expect(200)
      .expect(mockTalentPoolsCandidatesDto);
  });

  it('hiring/talent-pools/candidates/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/hiring/talent-pools/candidates/1')
      .expect(200)
      .expect(mockTalentPoolsCandidatesDto);
  });

  it(':companyId/hiring/all-talent-pools/candidates (GET) ', () => {
    return request(app.getHttpServer())
      .get('/1/hiring/all-talent-pools/candidates')
      .expect(200)
      .expect(mockTalentPoolsCandidatesDto);
  });

  it('hiring/talent-pools/candidates/:id (PUT) ', () => {
    return request(app.getHttpServer())
      .put('/hiring/talent-pools/candidates/1')
      .send(mockTalentPoolsCandidatesDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('hiring/talent-pools/candidates/:id (DELETE) ', () => {
    return request(app.getHttpServer())
      .delete('/hiring/talent-pools/candidates/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/hiring/talent-pools/collaborators (POST) ', () => {
    return request(app.getHttpServer())
      .post('/1/hiring/talent-pools/collaborators')
      .send(mockTalentPoolsCollaboratorsDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('hiring/talent-pools/:id/collaborators (GET) ', () => {
    return request(app.getHttpServer())
      .get('/hiring/talent-pools/1/collaborators')
      .expect(200)
      .expect({collaborators: {}});
  });
  
  it('hiring/talent-pools/collaborators/:id (PUT) ', () => {
    return request(app.getHttpServer())
      .put('/hiring/talent-pools/collaborators/1')
      .send(mockTalentPoolsCollaboratorsDto)
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('hiring/talent-pools/collaborators/:id (DELETE) ', () => {
    return request(app.getHttpServer())
      .delete('/hiring/talent-pools/collaborators/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
