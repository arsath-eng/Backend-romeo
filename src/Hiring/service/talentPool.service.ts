import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TalentPool } from '@flows/allEntities/talentPool.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class TalentPoolService {

    constructor(
        @InjectRepository(TalentPool)
        private readonly talentPoolRepository: Repository<TalentPool>,
        @InjectRepository(HrmEmployeeDetails)
        private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
        private eventEmitter: EventEmitter2,
      ) {}


      async createTalentPool(body:any){

        try{
            const talentPool = new TalentPool()

            talentPool.name = body.name
            talentPool.description = body.description
            talentPool.icon = body.icon
            talentPool.companyId = body.companyId
            talentPool.candidates = body.candidates || []
            talentPool.sharedWith = body.sharedWith || []

            const savetalentPool = await this.talentPoolRepository.save(talentPool)

            if (savetalentPool.sharedWith.length  > 0 ) {
              const notificationRecipients = new Set<string>(talentPool.sharedWith);
  
            
  
            
            /* console.log(
              "All Notification Recipients (hiringLead + sharedWith):",
              Array.from(notificationRecipients)
            ); */
  
           
            const recipientIds = Array.from(notificationRecipients);
            // console.log(recipientIds,"recipientIds");
            const getCandidateEmails = await this.employeeDetailsRepository.query(
                `
                SELECT 
                    "employeeId",
                    email ->> 'work' AS "userName",
                    "fullName" ->> 'first' AS "firstName",
                    "companyId"
                FROM "hrm_employee_details"
                WHERE "employeeId" = ANY($1)
                `,
                [recipientIds]
            );
  
        
              for (const recipient of getCandidateEmails) {
                const email = recipient.userName;
                const fullName = recipient.firstName;
                const emitBody = {
                    sapCountType: 'candidate',
                    companyId: talentPool.companyId,
                    subjects: 'talentPool colloboration',
                    email: email,
                    body: `Hi ${fullName}, you have been invited to ${talentPool.name}. Please check the Talent Pool`,
                };
  
                this.eventEmitter.emit('send.email', emitBody);
            }
            
        }


            return {
                code: '201',
                jobs:[savetalentPool]
            }
        }catch(error){
            console.log(error)
            throw new HttpException('error',HttpStatus.BAD_REQUEST)

        }
        

      }

      async getAllTalentPools (
        companyId?:string,
        id?:String
    ){
        try{
            const query = this.talentPoolRepository.createQueryBuilder('talentPool')
            .where('talentPool.companyId = :companyId', { companyId })
            .orderBy('talentPool.createdAt', 'DESC');

            if (id) {
                query.andWhere('talentPool.id = :id', { id });
              }

            if (companyId) {
                query.andWhere('talentPool.companyId = :companyId',{companyId})
            }
            
            

            const talentPools = await query.getMany();

            const gettalentPool = talentPools.map(talentPool=>({
                id: talentPool.id,
                name: talentPool.name,
                description: talentPool.description,
                icon: talentPool.icon,
                companyId: talentPool.companyId,
                candidates: talentPool.candidates,
                sharedWith: talentPool.sharedWith,
                createdAt: talentPool.createdAt.toISOString(),
                updatedAt: talentPool.modifiedAt.toISOString(),
            }))

            return {
                code: '200',
                jobs: gettalentPool,
              };

        }catch(error){
            console.log(error)
            throw new HttpException('failed to get talentPool', HttpStatus.BAD_REQUEST)
        }
    }


    async updateTalentPools(id: string, body: any) {
        try {
          let talentPool = await this.talentPoolRepository.findOneBy({ id });
          if (!talentPool) {
            throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
          }
          

          const newSharedWith = body['sharedWith'] || [];
         
          const oldSharedWith = talentPool.sharedWith || [];
          const addedSharedWith = newSharedWith.filter(id => !oldSharedWith.includes(id));
    
          talentPool.name = body['name'] || talentPool.name;
          talentPool.icon = body['icon'] || talentPool.icon;
          talentPool.description = body['description'] || talentPool.description;
          talentPool.candidates = body['candidates'] || talentPool.candidates;
          talentPool.sharedWith = newSharedWith ;

          
    
          await this.talentPoolRepository.save(talentPool);

          if (addedSharedWith.length > 0 ) {
            const notificationRecipients = new Set<string>(addedSharedWith);
  
          console.log("addedSharedWith talentpool",addedSharedWith)
  
            
  
            
            const recipientIds = Array.from(notificationRecipients);
          
            const getCandidateEmails = await this.employeeDetailsRepository.query(
               `
                SELECT 
                    "employeeId",
                    email ->> 'work' AS "userName",
                    "fullName" ->> 'first' AS "firstName",
                    "companyId"
                FROM "hrm_employee_details"
                WHERE "employeeId" = ANY($1)
                `,
                [recipientIds]
            
            );
  
            
            
              for (const recipient of getCandidateEmails) {
                const email = recipient.userName;
                const fullName = recipient.firstName;
                const emitBody = {
                    sapCountType: 'talentPool',
                    companyId: talentPool.companyId,
                    subjects: 'talentPool invitation',
                    email: email,
                    body: `Hi ${fullName}, you have been invited to ${talentPool.name}. Please check the Talent Pool`,
                };
  
                this.eventEmitter.emit('send.email', emitBody);
            }
            
  
        }
          return { id: talentPool.id };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to update talentPool ', HttpStatus.BAD_REQUEST);
        }
      }


      async deleteTalentPool(id: string,moveId?:string) {
        try {

          const talentPoolToDelete = await this.talentPoolRepository.findOneBy({ id });
          if (!talentPoolToDelete) {
            throw new HttpException('Talent pool not found', HttpStatus.NOT_FOUND);
          }
          
        if (moveId) {
          
          const newTalentPool = await this.talentPoolRepository.findOneBy({ id: moveId });
          if (!newTalentPool) {
              throw new HttpException('Destination talent pool not found', HttpStatus.NOT_FOUND);
          }

          
          const combinedCandidates = Array.from(new Set([
              ...(newTalentPool.candidates || []),
              ...(talentPoolToDelete.candidates || [])
          ])); 

          newTalentPool.candidates = combinedCandidates;

        
          await this.talentPoolRepository.save(newTalentPool);
      }

        await this.talentPoolRepository.delete(id);
          return {
            status: 200,
            description: 'Success',
          };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to delete talentPool ', HttpStatus.BAD_REQUEST);
        }
      }
}
