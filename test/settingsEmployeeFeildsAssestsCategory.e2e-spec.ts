import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssetsCategoryModule } from '../src/settingsEmployeeFeildsAssetsCategory/module/module';
import { AssetsCategory } from '../src/settingsEmployeeFeildsAssetsCategory/entities/assetsCategory.entity';
import { Employee } from '../src/employee/entities/employee.entity';

describe('settingsEmployeeFeildsAssestsCategory (e2e)', () => {
  let app: INestApplication;
  const mockAuthGuard = {};
  const mockAssetsCategoryDto = {
    id: '1',
    name: 'name',
    createdAt: '2023-08-09',
    modifiedAt: '2023-08-09',
    companyId: '1',
  };

  const mockAssetsCategoryRepository = {
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue(mockAssetsCategoryDto),
    findOneOrFail: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };
  const mockEmployeeRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AssetsCategoryModule],
    })
      .overrideProvider(getRepositoryToken(AssetsCategory))
      .useValue(mockAssetsCategoryRepository)
      .overrideProvider(getRepositoryToken(Employee))
      .useValue(mockEmployeeRepository)
      .overrideGuard(AuthGuard('JWT'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(':companyId/settings/employee-feilds/assets-category (POST)', () => {
    return request(app.getHttpServer())
      .post('/1/settings/employee-feilds/assets-category')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it(':companyId/settings/employee-feilds/assets-category (GET)', () => {
    return request(app.getHttpServer())
      .get('/1/settings/employee-feilds/assets-category')
      .expect(200)
      .expect(mockAssetsCategoryDto);
  });

  it('settings/employee-feilds/assets-category/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put('/settings/employee-feilds/assets-category/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });

  it('settings/employee-feilds/assets-category/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/settings/employee-feilds/assets-category/1')
      .expect(200)
      .expect({
        statusCode: 200,
        description: 'success',
      });
  });
});
