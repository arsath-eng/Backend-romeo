import {
    HttpException,
    HttpStatus,
    Injectable,
  } from '@nestjs/common';
  import e, { Response } from 'express';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { HrmPerformanceTask } from '@flows/allEntities/performanceTask.entity';
import {v4 as uuidv4} from 'uuid';
import { employeeDetails } from '@flows/allDtos/employeeDetails.dto';

@Injectable()
export class NewPerformanceService {
    constructor(
        @InjectRepository(HrmEmployeeDetails) private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
        @InjectRepository(HrmPerformanceTask) private performanceTaskRepository: Repository<HrmPerformanceTask>,
    ) {}
    async getTask (  req: Request, employeeId) {
        try {
            let employeeDetails: HrmEmployeeDetails[];
            const newPerformanceTask = await this.performanceTaskRepository.find({where:{employeeId:employeeId}});
            if (newPerformanceTask.length > 0) {
                employeeDetails = await this.employeeDetailsRepository.find({where: { companyId: newPerformanceTask[0].companyId }});
            }
            for (var i=0;i<newPerformanceTask.length;i++) {
                const employee = employeeDetails.find((emp) => emp.employeeId === employeeId);
                newPerformanceTask[i]['employeeName'] = employee.fullName.first +' '+employee.fullName.last;
                newPerformanceTask[i]['empProfilePhoto'] = employee.profileImage;
                const creator = employeeDetails.find((emp) => emp.employeeId === newPerformanceTask[i].creatorId);
                newPerformanceTask[i]['creatorName'] = creator.fullName.first +' '+creator.fullName.last;
                newPerformanceTask[i]['creatorProfilePhoto'] = creator.profileImage;
            }
             return (newPerformanceTask);
        }
        catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async postTask (  req: Request, companyId) {
        try {
            const employeeId = req.body.employeeId;
            const task = req.body.task;
            const description = req.body.description;
            const empScore = req.body.empScore;
            const supScore = req.body.supScore;
            const status = req.body.status;
            const creatorId = req.body.creatorId;
            const score = req.body.score;
            const createdAt = new Date();
            const modifiedAt = new Date();
            const newPerformanceTask = this.performanceTaskRepository.create(
                {
                  employeeId,
                  task,
                  description,
                  empScore,
                  supScore,
                  status,
                  creatorId,
                  createdAt,
                  modifiedAt,
                  companyId,
                  score,
                  comments: []
                },
              );
            return await this.performanceTaskRepository.save(newPerformanceTask);
        }
        catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async postBulkTask (  req: Request, companyId) {
        try {
            let task = req.body;
            for (let i=0;i< task.length;i++) {
                task[i].comments = [];
            }
            return await this.performanceTaskRepository.save(task);
        }
        catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async putTaskById (  req: Request, id) {
        try {
            const newPerformanceTask = await this.performanceTaskRepository.findOne({ where: { id: id } });
            if (req.body.hasOwnProperty('employeeId')) {
                newPerformanceTask.employeeId = req.body.employeeId;
            }
            if (req.body.hasOwnProperty('task')) {
                newPerformanceTask.task = req.body.task;
            }
            if (req.body.hasOwnProperty('description')) {
                newPerformanceTask.description = req.body.description;
            }
            if (req.body.hasOwnProperty('empScore')) {
                newPerformanceTask.empScore = req.body.empScore;
            }
            if (req.body.hasOwnProperty('supScore')) {
                newPerformanceTask.supScore = req.body.supScore;
            }
            if (req.body.hasOwnProperty('status')) {
                newPerformanceTask.status = req.body.status;
            }
            if (req.body.hasOwnProperty('creatorId')) {
                newPerformanceTask.creatorId = req.body.creatorId;
            }
            if (req.body.hasOwnProperty('score')) {
                newPerformanceTask.score = req.body.score;
            }
            if (req.body.hasOwnProperty('comments')) {
                newPerformanceTask.comments = req.body.comments;
            }
            newPerformanceTask.modifiedAt = new Date();

            return await this.performanceTaskRepository.save(newPerformanceTask);
        }
        catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async deleteTaskById (  req: Request, id) {
        try {
            const newPerformanceTask = await this.performanceTaskRepository.findOne({ where: { id: id } });

            await this.performanceTaskRepository.remove(newPerformanceTask);
        }
        catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }

    async getCommentByEmployeeId (  req: Request, employeeId) {
        try {
            let comments = [];
            let employeeDetails: HrmEmployeeDetails[];
            const performanceTask = await this.performanceTaskRepository.find({where:{employeeId:employeeId}});
            if (performanceTask.length > 0) {
                employeeDetails = await this.employeeDetailsRepository.find({where: { employeeId: performanceTask[0].companyId }});
            }
            for (var i=0;i<performanceTask.length;i++) {
                for (var j=0;j<performanceTask[i].comments.length;i++) {
                    const sender = employeeDetails.find((sender) => sender.employeeId === performanceTask[i].comments[j].employeeId);
                    performanceTask[i].comments[j]['senderName'] = sender.fullName.first +' '+sender.fullName.last;
                    performanceTask[i].comments[j]['senderProfilePhoto'] = sender.profileImage;
                    comments.push(performanceTask[i].comments[j]);
                }
            }
             return (comments);
        }
        catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async getCommentByTaskId (  req: Request, taskId) {
        try {
            const performanceTask = await this.performanceTaskRepository.findOne({where:{id:taskId}});
            const allRmployees = await this.employeeDetailsRepository.find({where:{companyId:performanceTask.companyId}})
            const sender = allRmployees.find((item)=> item.employeeId === performanceTask.employeeId);
            for (var i=0;i<performanceTask.comments.length;i++) {
                performanceTask.comments[i]['senderName'] = sender.fullName.first +' '+sender.fullName.last;
                performanceTask.comments[i]['senderProfilePhoto'] = sender.profileImage;
            }
            performanceTask.comments.sort(function(a,b){return a.createdAt.getTime() - b.createdAt.getTime()});
             return (performanceTask.comments);
        }
        catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async postComment (  req: Request, companyId) {
        try {
            const performanceTask = await this.performanceTaskRepository.findOne({where:{id:req.body.taskId}});
            const employeeId = req.body.employeeId;
            const senderId = req.body.senderId;
            const msg = req.body.msg;
            const agreement = false;
            const answer = false;
            const createdAt = new Date();
            const modifiedAt = new Date();
            const newPerformanceComment =
                {
                  id: uuidv4(),
                  senderId,
                  employeeId,
                  msg,
                  answer,
                  agreement,
                  createdAt,
                  modifiedAt,
                  companyId,
                }
            performanceTask.comments.push(newPerformanceComment)
            await this.performanceTaskRepository.save(performanceTask);
            return newPerformanceComment;
        }
        catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async putCommentById (  req: Request, id: string) {
        try {
            const performanceTask = await this.performanceTaskRepository.findOne({ where: { id: req.body.taskId } });
            let newPerformanceComment = performanceTask.comments.find((task) => task.id === id);
            if (req.body.hasOwnProperty('employeeId')) {
                newPerformanceComment.employeeId = req.body.employeeId;
            }
            if (req.body.hasOwnProperty('senderId')) {
                newPerformanceComment.senderId = req.body.senderId;
            }
            if (req.body.hasOwnProperty('msg')) {
                newPerformanceComment.msg = req.body.msg;
            }
            if (req.body.hasOwnProperty('agreement')) {
                newPerformanceComment.agreement = req.body.agreement;
            }
            if (req.body.hasOwnProperty('answer')) {
                newPerformanceComment.answer = req.body.answer;
            }
            newPerformanceComment.modifiedAt = new Date();
            performanceTask.comments = performanceTask.comments.filter((task) => task.id !== id);
            performanceTask.comments.push(newPerformanceComment);
            return await this.performanceTaskRepository.save(performanceTask);
        }
        catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
    async deleteCommentById (  req: Request, id) {
        try {
            const performanceTask = await this.performanceTaskRepository.findOne({ where: { id: id } });
            performanceTask.comments = performanceTask.comments.filter((task) => task.id !== id);
            await this.performanceTaskRepository.remove(performanceTask);
        }
        catch (error) {
            console.log(error);
            throw new HttpException('error!', HttpStatus.BAD_REQUEST);
        }
    }
}
