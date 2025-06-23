/* import { EmailsNewService } from '../../ses/service/emails.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Redirect,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository, DataSource } from 'typeorm';
import { hrmHiring } from '@flows/allEntities/hrmHiring.entity';
import { ta } from 'date-fns/locale';
import { S3Service } from '@flows/s3/service/service';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class TalentPoolsService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(hrmHiring)
    private hiringRepository: Repository<hrmHiring>,
    private mailService: EmailsNewService,
    private s3Service: S3Service,
    @InjectDataSource() private datasource: DataSource,
    private eventEmitter: EventEmitter2
  ) {}
  async talentPoolTemplate(
    title,
    userName,
    userName2,
    jobRole,
    jobRole2,
    jobRole3,
    jobRole4,
  ) {
    const dummy = await this.s3Service.getEmailTemplate('CollabTalentPool');
    let body:string = dummy[0];
    const replacements = {
      "$jobRole$": jobRole,
      "$userName$": userName,
      "$userName2$": userName2,
      "$jobRole2$": jobRole2,
      "$jobRole3$": jobRole3,
      "$title$": title,
      "$jobRole4$": jobRole4,
    }
    body = body.replace(/\$(.*?)\$/g, (match) => {
      return replacements[match] || match;
    });
    return body;
  }
  async postTalentPools(talentPools: Body, companyId: string) {
    try {
      const talentPool = new hrmHiring();
      const name = talentPools['name'];
      const icon = talentPools['icon'];
      const description = talentPools['description'];
      const creatorId = talentPools['creatorId'];
      const collaborators = []
      const candidates =[]
      const newTalentPool = {
        name,
        icon,
        description,
        creatorId,
        collaborators,
        candidates
      };
      
     
      const employeeDetails = await this.datasource.query(
        'SELECT * FROM hrm_employee_details WHERE "companyId"=$1',
        [companyId],
      );
      const id = "1";
      const collaboratorId = creatorId;
      const creatorInfo = employeeDetails.find(
        (item) => item.employeeId === creatorId,
      );
      const job = creatorInfo.jobInformation.find((item) => item.active);
      const jobInfoOfCreator = job ? job : { jobTitle: 'N/A' };

      const collaboratorName =
        creatorInfo.fullName.first + ' ' + creatorInfo.fullName.last;
      const role = jobInfoOfCreator.jobTitle;
      const type = 'Creator';
      const email = true;
      const newcollobarator =
       {
          id,
          collaboratorId,
          collaboratorName,
          role,
          type,
          email,
        };
        newTalentPool.collaborators.push(newcollobarator)
        talentPool.type = 'hrm_hiring_talent_pool';
        talentPool.data = newTalentPool;
        talentPool.companyId = companyId;
        return await this.hiringRepository.save(talentPool);

    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTalentPools(companyId: string) {
    try {
      const talentPools = await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 AND "companyId"=$2',["hrm_hiring_talent_pool",companyId])
      let returnArray = talentPools.map((item)=>{
        return {
            id: item.id,
            ...item.data,
            companyId:item.companyId,
            createdAt:item.createdAt,
            modifiedAt:item.modifiedAt
        }
      })
      
      return returnArray;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTalentPoolsById(id: string) {
    try {
      const talentPool = await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 AND id=$2' ,["hrm_hiring_talent_pool",id])
      if(talentPool.length > 0) {
        let returnObj = {
            id: talentPool[0].id,
            ...talentPool[0].data,
            companyId:talentPool[0].companyId,
            createdAd:talentPool[0].createdAt,
            modifiedAt:talentPool[0].modifiedAt
        }
        return returnObj
      }else{
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
     
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putTalentPoolsById(id: string, body: Body) {
    try {
      const newTalentPool =  await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 AND id=$2' ,["hrm_hiring_talent_pool",id])
      if(newTalentPool.length>0){
         for(let [key, value] of Object.entries(body)){
            if (newTalentPool[0].data.hasOwnProperty(key)) {          
                newTalentPool[0].data[key] =  value;
            }
         }
          newTalentPool.modifiedAt = new Date(Date.now());
          return await this.hiringRepository.save(newTalentPool); 
      }

    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteTalentPoolsById(id: string, body: any) {
    try {
      const talentPool = await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 AND id=$2' ,["hrm_hiring_talent_pool",id])
      const res = await this.hiringRepository.remove(talentPool)
      if (body['method'] == 'move') {
        const talentPoolMove = await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 AND id=$2' ,["hrm_hiring_talent_pool",body.newTalentPoolId])
        if(talentPoolMove.length>0){
          if(talentPoolMove[0].data.candidates){
            talentPoolMove[0].data.candidates= [...talentPoolMove[0].data.candidates,...body.candidatesList]
          }else{
            talentPoolMove[0].data.candidates= body.candidatesList
          }
            await this.hiringRepository.save(talentPoolMove)
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postTalentPoolsCandidates(talentPoolsCandidates, companyId: string) {
    try {
      const id = talentPoolsCandidates[0]['talentPoolId']
      const talentPool = await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 AND "companyId"=$2 AND id=$3',["hrm_hiring_talent_pool",companyId,id])
      
      let newCandidateList= []
      for (let i = 0; i < talentPoolsCandidates.length; i++) {
        const candidateId = talentPoolsCandidates[i]['candidateId'];
        const talentPoolId = talentPoolsCandidates[i]['talentPoolId'];
        const comment = talentPoolsCandidates[i]['comment'];
        const addedBy = talentPoolsCandidates[i]['addedBy'];
        const createdAt = new Date(Date.now());
        const modifiedAt = new Date(Date.now());
        const newTalentPoolCandidate ={
            candidateId,
            talentPoolId,
            comment,
            addedBy,
            createdAt,
            modifiedAt,
            companyId,
          }; 
        newCandidateList.push(newTalentPoolCandidate)
      }
      if(talentPool){
        const mergedArray = talentPool[0].data.candidates.concat(newCandidateList)
        let filtered =   mergedArray.filter((obj, index, self) => 
        index === self.findIndex((t) => (
            t.candidateId === obj.candidateId
        ))
        );
        talentPool[0].data.candidates = filtered

        return await this.hiringRepository.save(talentPool)
      }else{
        throw new HttpException('error!', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTalentPoolsCandidates(id: string, companyId: string) {
    try {
      const talentPools = await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 AND "companyId"=$2 AND id=$3',["hrm_hiring_talent_pool",companyId,id])
      let allCandidates = talentPools[0].data.candidates
      
      return allCandidates;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTalentPoolsCandidatesById(id: string) {
    try {

      //TODO chould change
      const talentPool = await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 AND "companyId"=$2',["hrm_hiring_talent_pool",id])
      return talentPool;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getAllTalentPoolsCandidates(companyId: string) {
    try {
      const talentPools = await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 AND "companyId"=$2',["hrm_hiring_talent_pool",companyId])
      let allCandidates = []

        talentPools.map((item)=> {
          allCandidates.concat(item.data.candidates)
        })

      return allCandidates;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }


  async putTalentPoolsCandidatesById(id: string, body: any) {

    try {
      const talentPool = await this.datasource.query('SELECT * FROM hrm_hiring WHERE id=$1',[body.talentPoolId])
      let curentCandidate = talentPool[0].data.candidates.find((item)=> item.candidateId === id)
      let newCandidates = talentPool[0].data.candidates.filter((item)=> item.candidateId !== id)
        if(curentCandidate){
          if (body.hasOwnProperty('candidateId')) {
            curentCandidate.candidateId = body['candidateId'];
          }
          if (body.hasOwnProperty('talentPoolId')) {
            curentCandidate.talentPoolId = body['talentPoolId'];
          }
          if (body.hasOwnProperty('comment')) {
            curentCandidate.comment = body['comment'];
          }
          if (body.hasOwnProperty('addedBy')) {
            curentCandidate.addedBy = body['addedBy'];
          }
          curentCandidate.modifiedAt = new Date(Date.now());

          newCandidates.push(curentCandidate)
          await this.hiringRepository.save(talentPool)
        }else{
          throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }



    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }

  }

  async deleteTalentPoolsCandidatesById(id: string, talentpoolId: string) {
    try {
      const talentPools = await this.datasource.query('SELECT * FROM hrm_hiring WHERE id=$1',[talentpoolId])
      if(talentPools.length>0){
        talentPools[0].data.candidates = talentPools[0].data.candidates.filter((item)=> item.candidateId !== id)
      }
      const res = await this.hiringRepository.save(talentPools)
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
  async postTalentPoolsCollaborators(
    talentPoolsColloborators: Body,
    companyId: string,
  ) {
    try {
      const talenPool =  await this.datasource.query('SELECT * FROM hrm_hiring WHERE id=$1',[talentPoolsColloborators['talentPoolId']])
      const talentPoolId = talentPoolsColloborators['talentPoolId'];
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      for (
        let i = 0; i < talentPoolsColloborators['collaborators'].length; i++) {
        const collaboratorId =
          talentPoolsColloborators['collaborators'][i]['collaboratorId'];
        const type = talentPoolsColloborators['collaborators'][i]['type'];
        const email = talentPoolsColloborators['collaborators'][i]['email'];
        const collaboratorName =
          talentPoolsColloborators['collaborators'][i]['collaboratorName'];
        const role = talentPoolsColloborators['collaborators'][i]['role'];

        const newcollobarator ={
            talentPoolId,
            collaboratorId,
            collaboratorName,
            role,
            type,
            email,
            companyId,
          }

        talenPool[0].data.candidates.push(newcollobarator) 
      }

      const res = await this.hiringRepository.save(talenPool)
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTalentPoolsColloboratorsById(id: string) {
    try {
      const talentPool = await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 and id=$2',["hrm_hiring_talent_pool",id])
      const collobaratorsMain = {
        talentPoolId:talentPool[0].id,
        collaborators:talentPool[0].data.collaborators
      }
      return collobaratorsMain;
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putTalentPoolsColloboratorsById(
    talentPoolId: string,
    body: Body,
    req: Request,
  ) {

    try {
      const talenPool = await this.datasource.query('SELECT * FROM hrm_hiring WHERE type=$1 AND id=$2',["hrm_hiring_talent_pool",talentPoolId])
      let newColabs = []
      if (body.hasOwnProperty('collaborators')) {
        const collobarators =talenPool[0].data.collaborators

        for (let i = 0; i < body['collaborators'].length; i++) {
          const collaboratorId = body['collaborators'][i]['collaboratorId'];
          const collaboratorName = body['collaborators'][i]['collaboratorName'];
          const type = body['collaborators'][i]['type'];
          const email = body['collaborators'][i]['email'];
          const role = body['collaborators'][i]['role'];
 

          if (collobarators.includes(collaboratorId)) {
          } else {
            if (body['collaborators'][i]['email'] === true) {
              const Employee = await this.dataSource.query(
                `SELECT *,
                FROM hrm_employee_details e
                JOIN hrm_users u ON e."userId" = u."userId" AND e."employeeId"='${collaboratorId}'`
              ).then((res) => res[0]);
              if (Employee.username.includes('@')) {
                const body = await this.talentPoolTemplate(talenPool[0].data.name, collaboratorName, req.headers['userid'], talenPool[0].data.name, talenPool[0].data.name, talenPool[0].data.name, talenPool[0].data.name)
                const emitBody = { sapCountType:'talentPoolCollaborator', companyId: Employee.companyId, subjects: 'You are now a collaborator', email: Employee.username, body};
                this.eventEmitter.emit('send.email', emitBody);
              }
            }
          }

          const newcollobarator ={
              collaboratorId,
              collaboratorName,
              role,
              type,
              email,
              talentPoolId,
            }
            newColabs.push(newcollobarator)
        }
        talenPool[0].data.collaborators = newColabs
        await this.hiringRepository.save(talenPool)
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}

 */