import { accessLevelsDto } from '@flows/allDtos/accessLevels.dto';
import { accessLevels } from '@flows/allEntities/accessLevels.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AccessLevelsService {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
    ) {}

    async postAccessLevel(accessLevel: accessLevelsDto) {
        const savedAccessLevel = await this.dataSource.getRepository(accessLevels).save(accessLevel);
        return {id: savedAccessLevel.id};
    }
    async getAccessLevel(id: string, all: boolean, companyId: string) {
        let access: accessLevelsDto[];
        if (all) {
            access = await this.dataSource.query('SELECT * FROM access_levels WHERE "companyId" = $1', [companyId]);
        }
        else {
            access = await this.dataSource.query('SELECT * FROM access_levels WHERE "id" = $1', [id]);
        }
        return {code: 200, accessLevels: access};
    }
    async putAccessLevel(accessLevel: accessLevelsDto) {
        const savedAccessLevel = await this.dataSource.getRepository(accessLevels).save(accessLevel);
        return {id: savedAccessLevel.id};
    }
    async deleteAccessLevel(id: string) {
        await this.dataSource.getRepository(accessLevels).createQueryBuilder().delete().where({ id: id }).execute();
        return {status: 200, description: 'success'};
    }
}
