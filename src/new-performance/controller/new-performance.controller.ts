import { AuthGuard } from '@nestjs/passport';
import {
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
import { Response } from 'express';
import { NewPerformanceService } from '../service/new-performance.service';


@Controller()
export class NewPerformanceController {
    constructor(
        private readonly NewPerformanceService: NewPerformanceService,
        ) {}

        @Get('new-performance/task/:employeeId')
        async getTask(  @Request() req,@Param('employeeId') employeeId: string) {
          try {
            return await this.NewPerformanceService.getTask(   req,employeeId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
      
        @HttpCode(200)
        @Post('/:companyId/new-performance/task')
        async postTask(
          @Param('companyId') companyId: string,
           
          @Request() req,
        ) {
          try {
            return await this.NewPerformanceService.postTask(   req, companyId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
        @HttpCode(200)
        @Post('/:companyId/new-performance/tasks-list')
        async postBulkTask(
          @Param('companyId') companyId: string,
           
          @Request() req,
        ) {
          try {
            return await this.NewPerformanceService.postBulkTask(   req, companyId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
        @Put('/new-performance/task/:id')
        async putTask(
          @Param('id') id: string,
           
          @Request() req,
        ) {
          try {
            return await this.NewPerformanceService.putTaskById(   req, id);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
        @Delete('/new-performance/task/:id')
        async deleteTaskById(
          @Param('id') id: string,
           
          @Request() req,
        ) {
          try {
            await this.NewPerformanceService.deleteTaskById(   req, id);
            return {
              statusCode: 200,
              description: 'success',
            };
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }

        @Get('new-performance/task/comments/:taskId')
        async getCommentByTaskId(  @Request() req,@Param('taskId') taskId: string) {
          try {
            return await this.NewPerformanceService.getCommentByTaskId(   req,taskId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
      
        @HttpCode(200)
        @Post('/:companyId/new-performance/task/comments')
        async postComment(
          @Param('companyId') companyId: string,
           
          @Request() req,
        ) {
          try {
            return await this.NewPerformanceService.postComment(   req, companyId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }

        @Get('new-performance/task-all/comments/:employeeId')
        async getReportList(  @Request() req,@Param('employeeId') employeeId: string) {
          try {
            return await this.NewPerformanceService.getCommentByEmployeeId(   req,employeeId);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }

        @Put('/new-performance/task/comments/:id')
        async putCommentById(
          @Param('id') id: string,
           
          @Request() req,
        ) {
          try {
            return await this.NewPerformanceService.putCommentById(   req, id);
          } catch (error) {
            console.log(error);
            return (new HttpException('error!', HttpStatus.BAD_REQUEST));
          }
        }
        @Delete('/new-performance/task/comments/:id')
        async deleteCommentById(
          @Param('id') id: string,
           
          @Request() req,
        ) {
          try {
            await this.NewPerformanceService.deleteCommentById(   req, id);
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
