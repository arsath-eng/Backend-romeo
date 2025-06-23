import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { EmployeeModule } from '@flows/employee/module/employee.module';
import { DocumentsModule } from '@flows/documents/module/documents.module';
import { FilesModule } from '@flows/files/module/files.module';
import { ReportsModule } from '@flows/reports/module/module';
import { AccessLevelsEmployeesModule } from '@flows/settingsAccessLevelsEmployees/module/module';

@Module({
  imports: [
    EmployeeModule,
    DocumentsModule,
    FilesModule,
    ReportsModule,
    AccessLevelsEmployeesModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [],
})
export class SearchModule {}
