import {
  Controller,
  UseGuards,
  HttpException,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { CelebrationsService } from '../service/celebrations.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class CelebrationsController {
  constructor(private readonly celebrationsService: CelebrationsService) {}

  @Get(':companyId/celebrations')
  async getCelebrations(@Param('companyId') companyId: string) {
    try {
      return await this.celebrationsService.getCelebrations(companyId);
    } catch (error) {
      console.log(error);
      return (new HttpException('error!', HttpStatus.BAD_REQUEST));
    }
  }
}
