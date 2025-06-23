import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { OnboardingTask } from '../../allEntities/OnboardingTask.entity';
import { HrmFiles } from '../../allEntities/hrmFiles.entity';
import { DataSource, Repository } from 'typeorm';
import { HrmNotifications } from '@flows/allEntities/notifications.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { Request } from 'express';
import { HrmLeaveHistory } from '@flows/allEntities/leaveHistory.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';



interface Question {
  id: number;
  title: string;
  type: string;
  required: boolean;
  choices: string[];
  singleAns: string;
  multipleAns: string[];
  fileType?: string;
  uploadedFiles?: Array<{id: string, name: string}>;
  numberOfFiles: string;
  selectedFolder?:string;
  complianceId?:string;
  expiredDate?:string;
  
  
}

@Injectable()
export class onboardingTaskService {
    constructor(
        @InjectRepository(OnboardingTask)
        private readonly onboardingTaskRepository: Repository<OnboardingTask>,

        @InjectRepository(HrmNotifications)
        private notificationsRepository: Repository<HrmNotifications>,
        
        private notificationService: NotificationService,
        @InjectDataSource() private dataSource: DataSource,

        @InjectRepository(HrmFiles)
        private documentsRepository: Repository<HrmFiles>,
      ) {}


      async createOnboardingTask(req: Request,body: any) {
        try {
          const onboardingTask = new OnboardingTask();
          onboardingTask.name = req.body['name'];
          onboardingTask.categoryId = req.body['categoryId'];
          onboardingTask.description = req.body['description'];
          onboardingTask.companyId = req.body['companyId'];
          onboardingTask.questions = req.body['questions'];
          onboardingTask.startDate = req.body['startDate'];
          onboardingTask.endDate = req.body['endDate'];
          onboardingTask.status = req.body['status'];
          onboardingTask.assignees = req.body['assignees'];
          onboardingTask.responses = [];
    
          const taskSaved = await this.onboardingTaskRepository.save(onboardingTask);

          if (onboardingTask.assignees.employeeIds.length > 0 && onboardingTask.status === 'published') {
            const message = `New onboarding task ${onboardingTask.name} has been assigned to you.`;
            await this.notificationService.addNotifications(
              'OnboardingTask',
              message,
              taskSaved.id,
              onboardingTask.companyId,
              req.headers['userid'] as string, 
              onboardingTask.assignees.employeeIds
            );
          }

          return {
            id: taskSaved.id,
            message: 'onboarding task saved',
          };


        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to create onboarding task', HttpStatus.BAD_REQUEST);
        }
      }
    
      async getOnboardingTasks(companyId: string, id?: string) {
        try {
          const query = this.onboardingTaskRepository.createQueryBuilder('task')
            .where('task.companyId = :companyId', { companyId })
            .orderBy('task.createdAt', 'DESC');
      
          if (id) {
            query.andWhere('task.id = :id', { id });
          }
      
    
      
          const tasks = await query.getMany();
          const totalCount = await query.getCount();
      
          const formattedTasks = tasks.map(task => ({
            id: task.id,
            name: task.name,
            categoryId:task.categoryId,
            description: task.description,
            questions: task.questions.map(question => ({
              id: question.id,
              title: question.title,
              type: question.type,
              choices: question.choices,
              singleAns: question.singleAns,
              multipleAns: question.multipleAns,
              required: question.required,
              fileType: question.fileType,
              numberOfFiles:question.numberOfFiles,
              uploadedFiles: question.uploadedFiles,
              selectedFolder:question.selectedFolder,
              complianceId:question.complianceId,
              expiredDate:question.expiredDate,
            })) || [] ,
            responses: task.responses.map(response => ({
              employeeId: response.employeeId,
              status:response.status,
              responses: response.responses.map(resp => ({
                id: resp.id,
                title: resp.title,
                type: resp.type,
                choices: resp.choices,
                singleAns: resp.singleAns,
                multipleAns: resp.multipleAns,
                required: resp.required,
                fileType: resp.fileType,
                numberOfFiles:resp.numberOfFiles,
                uploadedFiles: resp.uploadedFiles,
                selectedFolder:resp.selectedFolder,
                complianceId:resp.complianceId,
                expiredDate:resp.expiredDate,
              })) || [],
            }))|| [],
            assignees: {
              everyone: task.assignees.everyone,
              employeeGroups: task.assignees.employeeGroups,
              employeeIds: task.assignees.employeeIds,
            },
            startDate: task.startDate,
            endDate: task.endDate,
            status: task.status,
            companyId: task.companyId,
            createdAt: task.createdAt.toISOString(),
            modifiedAt: task.modifiedAt.toISOString(),
          }));
      
          return {
            code: '200',
            totalCount: totalCount.toString(),
            tasks: formattedTasks,
          };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to get onboarding tasks', HttpStatus.BAD_REQUEST);
        }
      }
      
    
      async updateOnboardingTask(id: string, req: Request) {
        try {
          let task = await this.onboardingTaskRepository.findOneBy({ id });
          if (!task) {
            throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
          }

          const oldStatus = task.status;
    
          task.name = req.body['name'] || task.name;
          task.description = req.body['description']|| task.description;
          task.companyId = req.body['companyId']|| task.companyId;;
          task.questions = req.body['questions']|| task.questions;;
          task.categoryId = req.body['categoryId']|| task.categoryId;;
          task.startDate = req.body['startDate']|| task.startDate;;
          task.endDate = req.body['endDate']|| task.endDate;;
          task.status = req.body['status']|| task.status;;
          task.assignees = req.body['assignees']|| task.assignees;
          task.responses = req.body['responses']|| task.responses;;
    
          await this.onboardingTaskRepository.save(task);

          if (oldStatus !== 'published' && task.status === 'published' && task.assignees.employeeIds.length > 0) {
            await this.notificationService.addNotifications(
              'OnboardingTask',
              `New onboarding task ${task.name} has been assigned to you.`,
              task.id,
              task.companyId,
              req.headers['userid'] as string, 
              task.assignees.employeeIds
            );
          }

          if(req.body['assignees']){
            const newEmployeeIds: string[] = req.body['assignees'].employeeIds.filter(item => !task.assignees.employeeIds.includes(item));
            const removedEmployeeIds = task.assignees.employeeIds.filter(item => !req.body['assignees'].employeeIds.includes(item));

            if (task.status === 'published') {
              if (newEmployeeIds.length > 0) {
                await this.notificationService.addNotifications(
                  'OnboardingTask',
                  `${task.name} has been assigned to you.`,
                  task.id,
                  task.companyId,
                  req.headers['userid'] as string, 
                  newEmployeeIds
                );
              }
              if (removedEmployeeIds.length > 0) {
                await this.notificationService.addNotifications(
                  'OnboardingTask',
                  `You were removed from ${task.name}. You can no longer access it`,
                  task.id,
                  task.companyId,
                  req.headers['userid'] as string, 
                  removedEmployeeIds
                );
              }
            }
          }

          
          return { id: task.id };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to update onboarding task', HttpStatus.BAD_REQUEST);
        }
      }
    
      async deleteOnboardingTask(id: string) {
        try {
          const onboardingTask: OnboardingTask = await this.dataSource.query(
                'SELECT * FROM onboarding_task WHERE "id"=$1',
                [id],
              ).then((res) => res[0]);
          await this.onboardingTaskRepository.delete(id);
          await this.notificationService.addNotifications(
              'alert', 
              `${onboardingTask.name} was deleted. You can no longer access it`, 
              onboardingTask.id, 
              onboardingTask.companyId,
              null, 
              onboardingTask.assignees.employeeIds
          );
          return { status: 'success', message: 'Onboarding task deleted successfully' };
        } catch (error) {
          console.error(error);
          throw new HttpException('Failed to delete onboarding task', HttpStatus.BAD_REQUEST);
        }
      }


      async submitOnboardingAnswers(
        req: Request,
        onboardingTaskId: string,
        employeeId: string,
        answers: Question[],
        status: string,
        adminAction?: string
      ) {
        try {
            const task = await this.onboardingTaskRepository.findOneBy( {id:onboardingTaskId} )
            if (!task) {
                throw new HttpException('Onboarding task not found', HttpStatus.NOT_FOUND);
            }
           
           
            const existingResponseIndex = task.responses.findIndex(
                response => response.employeeId === employeeId
            );
    
            if (existingResponseIndex !== -1) {
              if (answers && answers.length > 0) {
                task.responses[existingResponseIndex].responses = answers;
            }
            const employeeIdFromReq = req.headers['userid'] || req.body?.employeeId;


            const reviewer: HrmEmployeeDetails = await this.dataSource.query(
              `SELECT * FROM hrm_employee_details WHERE "employeeId"='${employeeIdFromReq}'`
            ).then(res => res[0]);

            const previousStatus = task.responses[existingResponseIndex].status;
            const newStatus = adminAction || status;
            task.responses[existingResponseIndex].status = adminAction || newStatus;
            if (newStatus === 'approved' && previousStatus !== 'approved') {
              await this.handleComplianceQuestions(employeeId, answers);
              const uploaderId = req.headers['userid'] || req.body?.employeeId;
              await this.handleUploadedDocuments(employeeId, answers, uploaderId);
            }

           
            let msg: string;
            if (status === 'approved') {
              msg = `Your response to ${task.name} was approved by ${reviewer.fullName.first} ${reviewer.fullName.last}`;
            }
            else if (status === 'resubmit') {
              msg = `You need to resend your response to ${task.name} as it was rejected by ${reviewer.fullName.first} ${reviewer.fullName.last}`;
            }
            else if (status === 'submitted') {
              msg = `You response to ${task.name} was submitted`;
            }
            else {
              msg = `Your response status for ${task.name} has been updated.`;
          }

            await this.notificationService.addNotifications(
                'alert', 
                msg, 
                task.id, 
                task.companyId,
                null, 
                [employeeId]
            );

            } else {
            if (!answers || answers.length === 0) {
              throw new HttpException('Answers must be provided for new submissions', HttpStatus.BAD_REQUEST);
          }
                const newStatus = adminAction || status;
            
                
                task.responses.push({
                    employeeId,
                    status: adminAction || status,
                    responses: answers ,
                });
                if (newStatus === 'approved') {
                  await this.handleComplianceQuestions(employeeId, answers);
                  const uploaderId = req.headers['userid'] || req.body?.employeeId;
                  await this.handleUploadedDocuments(employeeId, answers, uploaderId);
                }
            }
    
            await this.onboardingTaskRepository.save(task);
    
            return { status: 'success', message: 'Answers submitted successfully' };
        } catch (error) {
            console.error(error);
            throw new HttpException('Failed to submit onboarding answers', HttpStatus.BAD_REQUEST);
        }
    }

    private async handleComplianceQuestions(employeeId: string, responses: Question[]) {
      try {
        
        const complianceQuestions = responses.filter(question => question.type === 'compliance');
        
        if (complianceQuestions.length > 0) {
         
          const employee: HrmEmployeeDetails = await this.dataSource.query(
            `SELECT * FROM hrm_employee_details WHERE "employeeId"='${employeeId}'`
          ).then(res => res[0]);
          
          if (!employee) {
            throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
          }
          
          
          if (!employee.licences) {
            employee.licences = [];
          }
          let updated = false;
          
          for (const question of complianceQuestions) {
            const complianceConfig = await this.dataSource.query(
              `SELECT * FROM hrm_configs WHERE id = $1`,
              [question.complianceId]
            ).then(res => res[0]);
            
           
            let licenseType = '';
            if (complianceConfig && complianceConfig.data && complianceConfig.data.name) {
              licenseType = complianceConfig.data.name;
            }


            const licenceEntry = {
              licenseType:licenseType,
              fieldValue: question.singleAns || 'Compliance Document',
              expireDate: question.expiredDate || null,
              //requiredDocument: question.uploadedFiles && question.uploadedFiles.length > 0,
              //requiredDocumentCount: question.numberOfFiles || '0',
              // supportFormats: question.fileType ? [question.fileType.toUpperCase()] : ["PDF", "IMG"],
              defaultReminders: [
                  {
                    "amount": 1,
                    "frequency": "MONTH",
                    "timelineType": "BEFORE"
                }
              ],
              
              uploadedFiles: question.uploadedFiles || [],
              
            };
            
          
            const existingLicenceIndex = employee.licences.findIndex(
              licence => licence.complianceId === question.complianceId
            );
            
            if (existingLicenceIndex !== -1) {
              
              employee.licences[existingLicenceIndex] = {
                ...employee.licences[existingLicenceIndex],
                ...licenceEntry
              };
            } else {
              
              employee.licences.push(licenceEntry);
            }
            updated = true;
          }
          
          if (updated) {
            
            const result = await this.dataSource.query(
              `UPDATE hrm_employee_details 
               SET licences = $1 
               WHERE "employeeId" = $2`,
              [JSON.stringify(employee.licences), employeeId]
            );
            
            
            if (!result || result.affected === 0) {
              console.error('Failed to update employee licences');
              throw new HttpException('Failed to update employee licences', HttpStatus.INTERNAL_SERVER_ERROR);
            }
            
          }
        }
      } catch (error) {
        console.error('Error updating employee licences:', error);
        throw new HttpException('Failed to update employee licences', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    private async handleUploadedDocuments(employeeId: string, answers: Question[], uploaderId: string) {
      try {
       
        const uploadedFiles = answers
          .filter((question) => question.uploadedFiles && question.uploadedFiles.length > 0)
          .flatMap((question) =>
            question.uploadedFiles.map((file) => ({
              fileId: file.id,
              folderId: question.selectedFolder || null,
            }))
          );
    
        if (uploadedFiles.length === 0) {
          return;
        }
    
        const documents = [];
        for (const file of uploadedFiles) {
          const document = await this.documentsRepository.findOne({
            where: { id: file.fileId },
          });
    
          if (!document) {
            continue;
          }
    
          document.folderId = file.folderId;
          document.employeeId = employeeId;
          document.uploaderId = uploaderId;
    

          documents.push(document);
        }
    
        if (documents.length > 0) {
          await this.documentsRepository.save(documents);
          console.log('Documents updated successfully.');
        }
      } catch (error) {
        console.error('Error updating uploaded documents:', error);
        throw new HttpException('Failed to update uploaded documents', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    
}
