import { Controller, HttpException, HttpStatus, Post, Headers, Request, Param, Query, Get, Delete, Put } from '@nestjs/common';
import { AccessLevelsService } from './access-levels.service';
import { accessLevelsDto } from '@flows/allDtos/accessLevels.dto';

@Controller('/access-levels')
export class AccessLevelsController {
    constructor (private readonly accessLevelService: AccessLevelsService) {}

    @Post()
    async postAccessLevel(
      @Request() req,
    ) :Promise<{id: string}>{
      try {
        return await this.accessLevelService.postAccessLevel(req.body);
      } catch (error) {
        console.log(error);
        throw (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Get()
    async getAccessLevel(
        @Query('companyId') companyId: string,
        @Query('id') id?: string,
        @Query('all') all?: boolean,
    ) :Promise<{code: number, accessLevels: accessLevelsDto[]}>{
      try {
        return await this.accessLevelService.getAccessLevel(id, all, companyId);
      } catch (error) {
        console.log(error);
        throw (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Put()
    async putAccessLevel(
      @Request() req,
    ) :Promise<{id: string}>{
      try {
        return await this.accessLevelService.putAccessLevel(req.body);
      } catch (error) {
        console.log(error);
        throw (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
    @Delete()
    async deleteAccessLevel(
    @Query('id') id?: string,
    ) :Promise<{status: number, description: string}>{
      try {
        return await this.accessLevelService.deleteAccessLevel(id);
      } catch (error) {
        console.log(error);
        throw (new HttpException('error!', HttpStatus.BAD_REQUEST));
      }
    }
}
