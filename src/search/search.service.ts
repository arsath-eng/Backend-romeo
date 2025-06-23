import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmployeeService } from '@flows/employee/service/employee.service';
import { DocumentService } from '@flows/documents/service/documents.service';
import { FilesService } from '@flows/files/service/files.service';
import { ReportsService } from '@flows/reports/service/service';
import { Request } from 'express';
import { AccessLevelsEmployeesService } from '@flows/settingsAccessLevelsEmployees/service/service';
import { SpecialUserDto } from '@flows/allDtos/specialUser.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class SearchService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly documentService: DocumentService,
    private readonly filesservice: FilesService,
    private readonly reportsService: ReportsService,
    private readonly accessLevelsService: AccessLevelsEmployeesService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async Search(search: String, companyId: string, req: Request) {
    try {
      let userAccessLevel;
      const userList = await this.employeeService.getEmployeesDirectory(
        companyId, 'false'
      );

      
      search = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase();
      const regex = new RegExp(`.*${search}.*`, 'i');
      const userId = req.headers['userid'];
      const userIdString = String(userId);
      const filteredUserList = userList.filter((item) => {
        const fullName = `${item.fullName.first}${item.fullName.middle}${item.fullName.last}`;
        return regex.test(fullName.toLowerCase()) || regex.test(item.username);
      });

      const specialUser: SpecialUserDto = await this.dataSource.query(
        `SELECT * from special_user WHERE "id" = $1`,[userIdString]
      ).then(res => res[0])
      if (specialUser) {
        userAccessLevel = specialUser.companies.find((company) => company.companyId === companyId).accessLevelId;
      }
      else {
        userAccessLevel = await this.accessLevelsService.getAccessLevelsByEmployeeId(userIdString);
      }

    const AccessLeveldocumentsPermission = userAccessLevel?.access?.personal?.documents?.view === true;
    const AccessLevelFilesPermissions = userAccessLevel?.access?.featuresConfigs?.files?.view === true;

    const reportsPermission = userAccessLevel?.access?.personal?.reports?.SHOW_STD_REPORTS ;
    // console.log("Files Permissions from Access Level:", userAccessLevel?.access?.features?.files);
   
    
    const documentsList = await this.documentService.getSharedDocumentsForFolders(companyId);
    const filteredDocumentsList = documentsList.filter((item) => {
      if (!item.folderName) {
        return false; 
      }
      //console.log("filteredDocumentsList",filteredDocumentsList)
      const documentPermission = item.id !== null && (item.sharedWithAll === true )
      
      return (
        regex.test(item.folderName.toLowerCase()) &&
        item.id !== null &&
        (item.sharedWithAll === true || AccessLeveldocumentsPermission)
      );
    });

     
      const filesList = await this.filesservice.getFilesSearch(companyId);
    
      const filteredFilesList = filesList.filter((item) => {
      if (!item.name) {
        return false; 
      }
       
      const userId = req.headers['userid'];
      const userIdString = String(userId);
      
      const filesPermission = item.access?.all || item.access?.employeeIds.includes(userIdString);
      
      
      return (
        regex.test(item.name.toLowerCase()) &&  
        item.id !== null &&
        (filesPermission || AccessLevelFilesPermissions)
      );

    });
    

     
    const reportsList = await this.reportsService.getReportList(req, companyId);
    const filteredReportsList = reportsList
    
      .filter((item) => {
        if (!item.reportName) {
          return false; 
        }
        
        return (
          (regex.test(item.reportName.toLowerCase()) && reportsPermission) ||
          item.sharedWith.includes(req.headers['userid'])
        );
      })
      .map((item) => {
        return {
          reportName: item.reportName,
          id: item.id,
          type: item.type,
        };
      });

      return {
        employees: filteredUserList,
        documents: filteredDocumentsList,
        files: filteredFilesList,
        reports: filteredReportsList,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('error!', HttpStatus.BAD_REQUEST);
    }
  }
}
