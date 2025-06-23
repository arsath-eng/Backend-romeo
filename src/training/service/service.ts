/* import { HrmConfigs } from '@flows/allEntities/configs.entity';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmTrainingComplete } from '@flows/allEntities/trainingComplete.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Request } from 'express';
import { Repository } from 'typeorm';
@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(HrmConfigs)
    private commonRepository: Repository<HrmConfigs>,
    @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    @InjectRepository(HrmTrainingComplete)
    private trainingCompleteRepository: Repository<HrmTrainingComplete>,

  ) { }

  async postTraining(req: Request,   companyId: string) {
    try {
      const name = req.body.name;
      const description = req.body.description;
      const link = req.body.link;
      const categoryId = req.body.categoryId;
      const hasCategory = req.body.hasCategory;
      const frequency = req.body.frequency;
      const repeat = req.body.repeat;
      const every = req.body.every;
      const monthNo = [];
      if (frequency === 'Renewing' && repeat === 'Monthly') {
        for (let i = 0; i < 12; i = i + every) {
          monthNo.push(i);
        }
      }
      if (frequency === 'Renewing' && repeat === 'Yearly') {

        monthNo.push(0);

      }
      const attachfiles = req.body.attachfiles;
      const required = req.body.required;
      const requiredList = (req.body.requiredList);
      const due = req.body.due;
      const dueDate = req.body.dueDate;
      const completedList = req.body.completedList;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const Training = {
        name,
        description,
        link,
        categoryId,
        hasCategory,
        frequency,
        repeat,
        every,
        attachfiles,
        required,
        requiredList,
        due,
        dueDate,
        completedList,
        monthNo,
      };
      const newTraining = this.commonRepository.create({
        type: 'training',
        data: Training,
        companyId,
        createdAt,
        modifiedAt,
      });
      return await this.commonRepository.save(newTraining);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTraining(  companyId: string) {
    try {
      const trainings = await this.commonRepository.find({ where: { companyId: companyId , type:"training"} });
      let trainingList = [];
      const employeeList = await this.employeeDetailsRepository.find({ where: { companyId: companyId } });
      for (let i = 0; i < trainings.length; i++) {
        const idList = [];
        trainings[i].data.requiredList = (trainings[i].data.requiredList);
        if (trainings[i].data.requiredList.length != 0) {
          for (let j = 0; j < trainings[i].data.requiredList.length; j++) {
            if ((trainings[i].data.requiredList[j]['name'] === 'Employee Status')) {
              for (let k = 0; k < trainings[i].data.requiredList[j]['list'].length; k++) {
                const employeeIds = employeeList.filter((employee) => employee.status === trainings[i].data.requiredList[j]['list'][k]);
                if (employeeIds.length != 0) {
                  for (let l = 0; l < employeeIds.length; l++) {
                    idList.push(employeeIds[l].employeeId);
                  }
                }
              }
            }
            if ((trainings[i].data.requiredList[j]['name'] === 'Division')) {
              for (let k = 0; k < trainings[i].data.requiredList[j]['list'].length; k++) {
                const employeeIds = employeeList.filter((employee) => employee.jobInformation[0].division === trainings[i].data.requiredList[j]['list'][k]);
                if (employeeIds.length != 0) {
                  for (let l = 0; l < employeeIds.length; l++) {
                    idList.push(employeeIds[l].employeeId);
                  }
                }
              }
            }
            if ((trainings[i].data.requiredList[j]['name'] === 'Department')) {
              for (let k = 0; k < trainings[i].data.requiredList[j]['list'].length; k++) {
                const employeeIds = employeeList.filter((employee) => employee.jobInformation[0].department === trainings[i].data.requiredList[j]['list'][k]);
                if (employeeIds.length != 0) {
                  for (let l = 0; l < employeeIds.length; l++) {
                    idList.push(employeeIds[l].employeeId);
                  }
                }
              }
            }
            if ((trainings[i].data.requiredList[j]['name'] === 'Job Title')) {
              for (let k = 0; k < trainings[i].data.requiredList[j]['list'].length; k++) {
                const employeeIds = employeeList.filter((employee) => employee.jobInformation[0].jobTitle === trainings[i].data.requiredList[j]['list'][k]);
                if (employeeIds.length != 0) {
                  for (let l = 0; l < employeeIds.length; l++) {
                    idList.push(employeeIds[l].employeeId);
                  }
                }
              }
            }
            if ((trainings[i].data.requiredList[j]['name'] === 'Location')) {
              for (let k = 0; k < trainings[i].data.requiredList[j]['list'].length; k++) {
                const employeeIds = employeeList.filter((employee) => employee.jobInformation[0].location === trainings[i].data.requiredList[j]['list'][k]);
                if (employeeIds.length != 0) {
                  for (let l = 0; l < employeeIds.length; l++) {
                    idList.push(employeeIds[l].employeeId);
                  }
                }
              }
            }
          }
          const idListFiltered = [...new Set(idList)];
          trainings[i]['accessList'] = idListFiltered;
        } else if (trainings[i].data.requiredList.length == 0) {
          const employeeIds = employeeList;
          if (employeeIds.length != 0) {
            for (let l = 0; l < employeeIds.length; l++) {
              idList.push(employeeIds[l].employeeId);
            }
            const idListFiltered = [...new Set(idList)];
            trainings[i]['accessList'] = idListFiltered;
          }
        }

        const trainingComplete = await this.trainingCompleteRepository.find(
          { where: { trainingId: trainings[i].id } });
        const employeeIdList = [];
        for (let i = 0; i < trainingComplete.length; i++) {
          employeeIdList.push(trainingComplete[i].employeeId);
        }
        trainings[i]['completedList'] = employeeIdList;
        const training = {
          ...trainings[i].data,
          id: trainings[i].id,
          companyId: trainings[i].companyId,
          createdAt: trainings[i].createdAt,
          modifiedAt: trainings[i].modifiedAt,
          accessList: trainings[i]["accessList"],
          completedList: trainings[i]["completedList"],
        }
        trainingList.push(training);
      }
       return (trainingList);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTrainingByEmployeeId(  id: string, companyId: string) {
    try {
      const filteredTrainings = [];
      const trainings = await this.commonRepository.find({ where: { companyId: companyId, type: "training" } });
      const trainingCompletes = await this.trainingCompleteRepository.find( { where: { companyId: companyId } });
      const employeeList = await this.employeeDetailsRepository.find({ where: { companyId: companyId } });
      for (let i = 0; i < trainings.length; i++) {
        const idList = [];
        trainings[i].data.requiredList = (trainings[i].data.requiredList);
        if (trainings[i].data.requiredList.length != 0) {
          for (let j = 0; j < trainings[i].data.requiredList.length; j++) {
            if ((trainings[i].data.requiredList[j]['name'] === 'Employee Status')) {
              for (let k = 0; k < trainings[i].data.requiredList[j]['list'].length; k++) {
                const employeeIds = employeeList.filter((employee) => employee.status === trainings[i].data.requiredList[j]['list'][k]);
                if (employeeIds.length != 0) {
                  for (let l = 0; l < employeeIds.length; l++) {
                    idList.push(employeeIds[l].employeeId);
                  }
                }
              }
            }
            if ((trainings[i].data.requiredList[j]['name'] === 'Division')) {
              for (let k = 0; k < trainings[i].data.requiredList[j]['list'].length; k++) {
                const employeeIds = employeeList.filter((employee) => employee.jobInformation[0].division === trainings[i].data.requiredList[j]['list'][k]);
                if (employeeIds.length != 0) {
                  for (let l = 0; l < employeeIds.length; l++) {
                    idList.push(employeeIds[l].employeeId);
                  }
                }
              }
            }

            if ((trainings[i].data.requiredList[j]['name'] === 'Department')) {
              for (let k = 0; k < trainings[i].data.requiredList[j]['list'].length; k++) {
                const employeeIds = employeeList.filter((employee) => employee.jobInformation[0].department === trainings[i].data.requiredList[j]['list'][k]);
                if (employeeIds.length != 0) {
                  for (let l = 0; l < employeeIds.length; l++) {
                    idList.push(employeeIds[l].employeeId);
                  }
                }
              }
            }

            if ((trainings[i].data.requiredList[j]['name'] === 'Job Title')) {
              for (let k = 0; k < trainings[i].data.requiredList[j]['list'].length; k++) {
                const employeeIds = employeeList.filter((employee) => employee.jobInformation[0].jobTitle === trainings[i].data.requiredList[j]['list'][k]);
                if (employeeIds.length != 0) {
                  for (let l = 0; l < employeeIds.length; l++) {
                    idList.push(employeeIds[l].employeeId);
                  }
                }
              }
            }

            if ((trainings[i].data.requiredList[j]['name'] === 'Location')) {
              for (let k = 0; k < trainings[i].data.requiredList[j]['list'].length; k++) {
                const employeeIds = employeeList.filter((employee) => employee.jobInformation[0].location === trainings[i].data.requiredList[j]['list'][k]);
                if (employeeIds.length != 0) {
                  for (let l = 0; l < employeeIds.length; l++) {
                    idList.push(employeeIds[l].employeeId);
                  }
                }
              }
            }
          }
          trainings[i]['accessList'] = idList;
        } else if (trainings[i].data.requiredList.length == 0) {
          const employeeIds = employeeList;
          if (employeeIds.length != 0) {
            for (let l = 0; l < employeeIds.length; l++) {
              idList.push(employeeIds[l].employeeId);
            }
            trainings[i]['accessList'] = idList;
          }
        }
        const trainingComplete = trainingCompletes.filter((t) => t.trainingId === trainings[i].id);
        const employeeIdList = [];
        for (let i = 0; i < trainingComplete.length; i++) {
          employeeIdList.push(trainingComplete[i].employeeId);
        }
        trainings[i]['completedList'] = employeeIdList;
        
        if (trainings[i]['accessList'].includes(id)) {
          filteredTrainings.push({
            ...trainings[i].data,
            id: trainings[i].id,
            companyId: trainings[i].companyId,
            createdAt: trainings[i].createdAt,
            modifiedAt: trainings[i].modifiedAt,
            accessList: trainings[i]["accessList"],
            completedList: trainings[i]["completedList"],
          });
        }
      }
       return (filteredTrainings);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }


  async putTrainingById(
    id: string,
    req: Request,
      
  ) {
    try {
      const training = await this.commonRepository.findOneOrFail({
        where: { id: id, type: "training"},
      });
      if (req.body.hasOwnProperty('name')) {
        training.data.name = req.body['name'];
      }
      if (req.body.hasOwnProperty('description')) {
        training.data.description = req.body['description'];
      }
      if (req.body.hasOwnProperty('link')) {
        training.data.link = req.body['link'];
      }
      if (req.body.hasOwnProperty('categoryId')) {
        training.data.categoryId = req.body['categoryId'];
      }
      if (req.body.hasOwnProperty('hasCategory')) {
        training.data.hasCategory = req.body['hasCategory'];
      }
      if (req.body.hasOwnProperty('frequency')) {
        training.data.frequency = req.body['frequency'];
      }
      if (req.body.hasOwnProperty('repeat')) {
        training.data.repeat = req.body['repeat'];
      }
      if (req.body.hasOwnProperty('every')) {
        training.data.every = req.body['every'];
      }
      if (req.body.hasOwnProperty('attachfiles')) {
        training.data.attachfiles = req.body['attachfiles'];
      }
      if (req.body.hasOwnProperty('required')) {
        training.data.required = req.body['required'];
      }
      if (req.body.hasOwnProperty('requiredList')) {
        training.data.requiredList = (req.body['requiredList']);
      }
      if (req.body.hasOwnProperty('due')) {
        training.data.due = req.body['due'];
      }
      if (req.body.hasOwnProperty('dueDate')) {
        training.data.dueDate = req.body['dueDate'];
      }
      if (req.body.hasOwnProperty('completedList')) {
        training.data.completedList = req.body['completedList'];
      }
      const monthNo = [];
      if (training.data.frequency === 'Renewing' && training.data.repeat === 'Monthly') {
        for (let i = 0; i < 12; i = i + training.data.every) {
          monthNo.push(i);
        }
      }
      if (training.data.frequency === 'Renewing' && training.data.repeat === 'Yearly') {

        monthNo.push(0);

      }
      training.data.monthNo = monthNo;
      training.data.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(training);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteTrainingById(id: string     ) {
    try {
      const training = await this.commonRepository.findOneOrFail({
        where: { id: id,type:"training" },
      });
      await this.commonRepository.remove(training);

      const training_complete = await this.trainingCompleteRepository.findOneOrFail({
        where: { trainingId: id },
      });
      await this.trainingCompleteRepository.remove(training_complete);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async postTrainingCategory(req: Request,   companyId: string) {
    try {
      const name = req.body.name;
      const createdAt = new Date(Date.now());
      const modifiedAt = new Date(Date.now());

      const newTrainingCategory = {
        name: name,
      }

      const trainingCategory = this.commonRepository.create({
        type: 'trainingCategory',
        data: newTrainingCategory,
        companyId,
        createdAt,
        modifiedAt, 
      });
      return await this.commonRepository.save(trainingCategory);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTrainingCategory(  companyId: string) {
    try {
      const trainingCategory = await this.commonRepository.find({ where: { companyId: companyId, type: "trainingCategory" } });
      let trainingCategoryList = [];
      for(let i=0; i<trainingCategory.length; i++){
        const training = {
          ...trainingCategory[i].data,
          id: trainingCategory[i].id,
          companyId: trainingCategory[i].companyId,
          createdAt: trainingCategory[i].createdAt,
          modifiedAt: trainingCategory[i].modifiedAt,
        }
        trainingCategoryList.push(training);
      }
      return trainingCategoryList;
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async getTrainingCategoryById(  id: string) {
    try {
      const trainingCategory = await this.commonRepository.findOne({ where: { id: id } });
      let trainingCategoryObj = {
        ...trainingCategory.data,
        id: trainingCategory.id,
        companyId: trainingCategory.companyId,
        createdAt: trainingCategory.createdAt,
        modifiedAt: trainingCategory.modifiedAt,
      }
       return (trainingCategoryObj);
    } catch (error) {
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async putTrainingCategoryById(
    id: string,
    req: Request,
      
  ) {
    try {
      const trainingCategory = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      if (req.body.hasOwnProperty('name')) {
        trainingCategory.data.name = req.body['name'];
      }
      trainingCategory.modifiedAt = new Date(Date.now());
      return await this.commonRepository.save(trainingCategory);
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteTrainingCategoryById(
    id: string,
      
  ) {
    try {
      const trainingCategory = await this.commonRepository.findOneOrFail({
        where: { id: id },
      });
      await this.commonRepository.remove(trainingCategory);
      const trainings = await this.commonRepository.find({
        where: { companyId: trainingCategory.companyId },
      }).then((trainings) => trainings.filter((training) => training.data.categoryId === id));

      for (let k = 0; k < trainings.length; k++) {
        await this.commonRepository.remove(trainings[k]);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

}
 */