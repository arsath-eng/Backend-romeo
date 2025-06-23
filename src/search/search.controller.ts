import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from '@nestjs/passport';


@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  
  @HttpCode(200)
  @Get(':companyId/custom-search')
  async getSearch(
    @Request() req,
    @Query('search') search: string,
    @Param('companyId') companyId: string,
    ) {
    try {
      return await this.searchService.Search(search,companyId,req);
    } catch (error) {
      console.log(error);
      return new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }

}
