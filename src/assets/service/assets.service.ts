import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { DataSource, Repository } from 'typeorm';
import { AssetsDto } from '../../allDtos/assets.dto';
import { AccAssets } from '@flows/allEntities/assets.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { Request } from 'express';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(AccAssets)
    private assetsRepository: Repository<AccAssets>,
    private readonly notificationService: NotificationService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async postAssets(req:Request, assets: AssetsDto, companyId: string) {
    try {
      const employeeDetails: HrmEmployeeDetails = await this.dataSource.query(
        'SELECT * FROM hrm_employee_details WHERE "employeeId"=$1',
        [req.headers['userid'] as string],
      ).then(res => res[0]);
      const employeeId = assets.employeeId;
      const aseetsCategoryId = assets.aseetsCategoryId;
      const assetsDescription = assets.assetsDescription;
      const serial = assets.serial;
      const dateAssigned = assets.dateAssigned;
      const dateReturned = assets.dateReturned;
      const type = 'assets';
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());
      const newnote = this.assetsRepository.create({
        employeeId,
        aseetsCategoryId,
        assetsDescription,
        serial,
        dateAssigned,
        dateReturned,
        createdAt,
        modifiedAt,
        companyId,
      });
      const savedAssets = await this.assetsRepository.save(newnote);
      await this.notificationService.addNotifications('assetRequest', `${employeeDetails.fullName.first + ' ' + employeeDetails.fullName.last} is requesting a claim`, savedAssets['id'], companyId, req.headers['userid'] as string);
      return savedAssets;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getAssets(companyId: string) {
    try {
      const assets = await this.assetsRepository.find({
        where: { companyId: companyId},
      });
      return assets;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getAssetsById(id: string) {
    try {
      const asset = await this.assetsRepository.findOne({
        where: { id: id },
      });
      return asset;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putAssetsById(id: string, body: Body) {
    try {
      const asset = await this.assetsRepository.findOneOrFail({
        where: { id: id },
      });
      if (body.hasOwnProperty('employeeId')) {
        asset.employeeId = body['employeeId'];
      }
      if (body.hasOwnProperty('aseetsCategoryId')) {
        asset.aseetsCategoryId = body['aseetsCategoryId'];
      }
      if (body.hasOwnProperty('assetsDescription')) {
        asset.assetsDescription = body['assetsDescription'];
      }
      if (body.hasOwnProperty('serial')) {
        asset.serial = body['serial'];
      }
      if (body.hasOwnProperty('dateAssigned')) {
        asset.dateAssigned = body['dateAssigned'];
      }
      if (body.hasOwnProperty('dateReturned')) {
        asset.dateReturned = body['dateReturned'];
      }
      asset.modifiedAt = new Date(Date.now());
      return await this.assetsRepository.save(asset);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteAssetsById(id: string) {
    try {
      const note = await this.assetsRepository.findOneOrFail({
        where: { id: id },
      });
      await this.assetsRepository.remove(note);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
