/* import {
  Body,
  Controller,
  Request,
  Post,
  Res,
  UseGuards,
  HttpCode,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { TalentPoolsService } from '../service/talentPools.service';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

@Controller()
export class TalentPoolsController {
  constructor(private readonly talentPoolsService: TalentPoolsService) {}

  @HttpCode(200)
  @Post(':companyId/hiring/talent-pools')
  async postTalentPools(
    @Body() talentPools: Body,
     
    @Request() req,
    @Param('companyId') companyId: string

  ) {
    try {
      return await this.talentPoolsService.postTalentPools(talentPools,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/hiring/talent-pools')
  async getTalentPools( @Param('companyId') companyId: string
  ) {
    try {
      return await this.talentPoolsService.getTalentPools(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('hiring/talent-pools/:id')
  async getTalentPoolsById(@Param('id') id: string,  ) {
    try {
      return await this.talentPoolsService.getTalentPoolsById(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('hiring/talent-pools/:id')
  async putTalentPoolsById(
    @Param('id') id: string,
    @Body() body: Body,
     
  ) {
    try {
      return await this.talentPoolsService.putTalentPoolsById(id, body  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('hiring/talent-pools/:id')
  async deleteTalentPoolsById(
    @Param('id') id: string,
    @Body() body: Body,
     
  ) {
    try {
      await this.talentPoolsService.deleteTalentPoolsById(id, body  );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @HttpCode(200)
  @Post(':companyId/hiring/talent-pools/candidates')
  async postTalentPoolsCandidates(
    @Body() talentPoolsCandidates: Body,
     
    @Request() req
    ,@Param('companyId') companyId: string

  ) {
    try {
      await this.talentPoolsService.postTalentPoolsCandidates(
        talentPoolsCandidates,
          companyId
      );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
  @Get(':companyId/hiring/talent-pools/:id/candidates')
  async getTalentPoolsCandidates(
    @Param('id') id: string,
 @Param('companyId') companyId: string

  ) {
    try {
      return await this.talentPoolsService.getTalentPoolsCandidates(id,   companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('hiring/talent-pools/candidates/:id')
  async getTalentPoolsCandidatesById(
    @Param('id') id: string,
     
  ) {
    try {
      return await this.talentPoolsService.getTalentPoolsCandidatesById(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get(':companyId/hiring/all-talent-pools/candidates')
  async getAllTalentPoolsCandidates(
    @Param('id') id: string,
 @Param('companyId') companyId: string

  ) {
    try {
      return await this.talentPoolsService.getAllTalentPoolsCandidates(  companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('hiring/talent-pools/candidates/:id')
  async putTalentPoolsCandidatesById(
    @Param('id') id: string,
    @Body() body: Body,
     
  ) {
    try {

     return  await this.talentPoolsService.putTalentPoolsCandidatesById(id, body  );
    

    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Delete('hiring/talent-pools/candidates/:talentpoolId/:id')
  async deleteTalentPoolsCandidatesById(
    @Param('id') id: string,
    @Param('talentpoolId') talentpoolId: string,
  ) {
    try {
     return  await this.talentPoolsService.deleteTalentPoolsCandidatesById(id,talentpoolId);
    
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @HttpCode(200)
  @Post(':companyId/hiring/talent-pools/collaborators')
  async postTalentPoolsCollaborators(
    @Body() talentPoolsColloborators: Body,
     
    @Request() req,@Param('companyId') companyId: string

  ) {
    try {
      await this.talentPoolsService.postTalentPoolsCollaborators(
        talentPoolsColloborators,
          companyId
      );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Get('hiring/talent-pools/:id/collaborators')
  async getTalentPoolsColloboratorsById(
    @Param('id') id: string,
     
  ) {
    try {
      return await this.talentPoolsService.getTalentPoolsColloboratorsById(id  );
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }

  @Put('hiring/talent-pools/collaborators/:id')
  async putTalentPoolsColloboratorsById(
    @Param('id') id: string,
    @Body() body: Body,
     
    @Request() req
  ) {
    try {
      await this.talentPoolsService.putTalentPoolsColloboratorsById(
        id,
        body,
          
        req,
      );
      return {
        statusCode: 200,
        description: 'success',
      };
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
 */