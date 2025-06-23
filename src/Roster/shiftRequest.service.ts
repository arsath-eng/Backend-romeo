import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrmShiftRequests } from '../allEntities/hrmShiftRequests.entity';
import { NotificationService } from '@flows/notifications/service/notifications.service';
import { HrmRosterEmployees,HrmRosterPositions,HrmRosterSites,HrmRosterShifts,HrmRosterTemplates } from '@flows/allEntities/hrmRoster.entity';
import { ca } from 'date-fns/locale';
import { HrmEmployeeDetails } from '@flows/allEntities/employeeDetails.entity';
import { S3Service } from '@flows/s3/service/service';
import { APIService } from '@flows/superAdminPortalAPI/APIservice.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class HrmShiftRequestsService {
  constructor(
    @InjectRepository(HrmShiftRequests)
    private readonly shiftRequestsRepo: Repository<HrmShiftRequests>,
     @InjectRepository(HrmRosterShifts) private rosterShiftsRepository: Repository<HrmRosterShifts>,
     private notificationService: NotificationService,
     @InjectRepository(HrmEmployeeDetails)
    private employeeDetailsRepository: Repository<HrmEmployeeDetails>,
    private s3Service: S3Service,
    private readonly APIService: APIService,
     private eventEmitter: EventEmitter2,
  ) {}

  async createShiftRequest(req) {
    try{
      const shiftRequest = new HrmShiftRequests()
    shiftRequest.type = req.body.type
    shiftRequest.shiftId = req.body.shiftId
    shiftRequest.employeeId = req.body.employeeId
    shiftRequest.siteName = req.body.siteName
    shiftRequest.positionName = req.body.positionName
    shiftRequest.shiftDate = req.body.shiftDate
    shiftRequest.startTime = req.body.startTime
    shiftRequest.endTime = req.body.endTime
    shiftRequest.isOvertime = req.body.isOvertime
    shiftRequest.companyId = req.body.companyId
    shiftRequest.status = req.body.status
    shiftRequest.changedBy = req.body.approvedBy
    shiftRequest.note = req.body.note
    const savedShiftRequest =  await this.shiftRequestsRepo.save(shiftRequest);

    const getemployeeName = await this.employeeDetailsRepository.query(
      `
      SELECT 
          "fullName" ->> 'first' AS "firstName"
      FROM "hrm_employee_details"
      WHERE "employeeId" = $1
      `,
      [req.body.employeeId]
    );
    const employeeName = getemployeeName[0]?.firstName;
    //console.log(employeeName)
    
    const fullAdminEmployees = await this.employeeDetailsRepository.query(`
      SELECT 
        e."employeeId", 
        e."email" ->> 'work' AS "workEmail"
      FROM "hrm_employee_details" e
      JOIN "access_levels" a ON e."accessLevelId" = a."id"
      WHERE a."accessLevelType" = 'FULL_ADMIN AND a."companyId" = $1'
    `, [req.body.companyId]);
    
    const fullAdminEmployeeIds = fullAdminEmployees.map(emp => emp.employeeId);
    const fullAdminEmails = fullAdminEmployees.map(emp => emp.workEmail);
    
    //console.log(fullAdminEmployeeIds)


    await this.notificationService.addNotifications(
      'shiftRequest',
      `${employeeName} is requesting to ${req.body.type} shift on ${req.body.shiftDate}`,
      savedShiftRequest.id,
      savedShiftRequest.companyId,
      savedShiftRequest.employeeId,
      [fullAdminEmployeeIds]
  );


  const companyId = savedShiftRequest.companyId
  const company = await this.APIService.getCompanyById(companyId);
  const dateObj = new Date(req.body.shiftDate); 

  const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' }); 

  const shiftDate = new Date(req.body.shiftDate); 
  const dayOfWeek = shiftDate.getDay(); 

          
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;

  const weekStart = new Date(shiftDate);
  weekStart.setDate(shiftDate.getDate() + diffToMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartDate = weekStart.toISOString().split('T')[0]; 
  const weekEndDate = weekEnd.toISOString().split('T')[0];    
   const companyLogo = `${process.env.DOMAIN}/assets/romeohr_main.png`
  console.log(fullAdminEmails)
  if (req.body.type == 'DROP'){
    const shiftUpdatdBody = await this.dropShiftRequestAdmin(employeeName,req.body.shiftDate,company.companyName,weekStartDate,weekEndDate,day,req.body.shiftDate, req.body.startTime,req.body.endTime,process.env.DOMAIN,companyLogo);
    const emitBody = { sapCountType:'OpenShift',companyId, subjects: 'Open Shift', email: fullAdminEmails, body: shiftUpdatdBody};

    
    this.eventEmitter.emit('send.email', emitBody);
  }
  //console.log('employeeName',employeeName,'date',res.date,'company.companyName',company.companyName,res.date,'day',day, res.startTime,res.endTime)
  
    
     return savedShiftRequest



    }catch(error){
      console.log(error)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    
  }



  async getShiftRequests(companyId: string, employeeId?: string ,status?:string ,id?:string){

    try{
      const query = this.shiftRequestsRepo.createQueryBuilder('request')
      .where('request.companyId = :companyId', { companyId });
  
    if (employeeId) {
      query.andWhere('request.employeeId = :employeeId', { employeeId });
    }

    if (status) {
      query.andWhere('request.status = :status', { status });
    }
    if (id) {
      query.andWhere('request.id = :id', { id });
    }
  
    return await query.getMany();
    }catch(error){
      console.log(error)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

   
  }


  async updateShiftRequest(req){

    try{
      const request = await this.shiftRequestsRepo.findOne({ where: { id: req.id } });
    if (!request) {
      throw new Error('Shift request not found');
    }
  const companyId = request.companyId
    const company = await this.APIService.getCompanyById(companyId);


    //request.changedBy = req.changedBy ;
    //request.status = req.status;
    //request.type = req.type;
  
   //await this.shiftRequestsRepo.save(request);
   const shift = await this.rosterShiftsRepository.findOne({ where: { id: request.shiftId } });


   switch (req.type) {
    case "DROP":
        if (req.status === "APPROVED") {
            console.log("DROP APPROVED");
            // Update the shift employeeId to the employeeId of the request
            request.changedBy = req.changedBy ;
            request.status = req.status;
            await this.shiftRequestsRepo.save(request);
            shift.employeeId = req.employeeId
            await this.rosterShiftsRepository.save(shift);
            const getemployeeDetails = await this.employeeDetailsRepository.query(
              `
              SELECT 
                  "fullName" ->> 'first' AS "firstName",
                   "email" ->> 'work' AS "workEmail"
              FROM "hrm_employee_details"
              WHERE "employeeId" = $1
              `,
              [shift.employeeId]
            );
            const companyId = shift.companyId
            const company = await this.APIService.getCompanyById(shift.companyId);
            const employeeName = getemployeeDetails[0]?.firstName;
            const employeeEmail = getemployeeDetails[0]?.workEmail;
            const companyLogo = `${process.env.DOMAIN}/assets/romeohr_main.png`

            console.log(employeeEmail)
            const dropshiftbody = await this.dropShift(employeeName,shift.date,company.companyName,process.env.DOMAIN,companyLogo);
            const emitBody = { sapCountType:'OpenShift',companyId, subjects: 'Drop Shift ', email: employeeEmail, body: dropshiftbody};
      
            
            console.log("before calling DROP/APPROVE Roster shift")
            this.eventEmitter.emit('send.email', emitBody);
            console.log("after calling DROP/APPROVE Roster shift")
            
        } else if (req.status === "REJECTED") {
          request.status = req.status;
          await this.shiftRequestsRepo.save(request);

          const getemployeeDetails = await this.employeeDetailsRepository.query(
            `
            SELECT 
                "fullName" ->> 'first' AS "firstName",
                 "email" ->> 'work' AS "workEmail"
            FROM "hrm_employee_details"
            WHERE "employeeId" = $1
            `,
            [shift.employeeId]
          );
      
          const employeeName = getemployeeDetails[0]?.firstName;
          const employeeEmail = getemployeeDetails[0]?.workEmail;
          const companyLogo = `${process.env.DOMAIN}/assets/romeohr_main.png`
          console.log(employeeEmail)
          const dropshiftbody = await this.rejectedDropShift(employeeName,shift.date,company.companyName,process.env.DOMAIN,companyLogo);
          const emitBody = { sapCountType:'OpenShift',companyId, subjects: 'Drop Shift', email: employeeEmail, body: dropshiftbody};
    
          
          console.log("before calling DROP/REJECT Roster shift")
          this.eventEmitter.emit('send.email', emitBody);
          console.log("after calling DROP/REJECT Roster shift")
        }
        break;
        
    case "OPEN":
        if (req.status === "APPROVED") {


            console.log("OPEN APPROVED");
            request.changedBy = req.changedBy ;
            request.status = req.status || request.status;
            await this.shiftRequestsRepo.save(request);
            // Update the shift employeeId to null/empty and mark as open
            shift.employeeId = '00000000-0000-0000-0000-000000000000';
            shift.isOpen = true;
            await this.rosterShiftsRepository.save(shift);
            
            // Create a new open shift request
            const newRequest = new HrmShiftRequests();
            newRequest.type = 'OPEN';
            newRequest.shiftId = request.shiftId;
            newRequest.employeeId = null;
            newRequest.siteName = request.siteName;
            newRequest.positionName = request.positionName;
            newRequest.shiftDate = request.shiftDate;
            newRequest.startTime = request.startTime;
            newRequest.endTime = request.endTime;
            newRequest.isOvertime = request.isOvertime;
            newRequest.companyId = request.companyId;
            newRequest.status = 'PENDING';
            newRequest.changedBy = req.changedBy;
            newRequest.note = null;
            
            const res = await this.shiftRequestsRepo.save(newRequest);

            const getCompanyEmployeeEmails = await this.employeeDetailsRepository.query(
              `
              SELECT 
                "employeeId",
                "fullName" ->> 'first' AS "firstName",
                "email" ->> 'work' AS "workEmail"
              FROM "hrm_employee_details"
              WHERE "companyId" = $1
                AND "email" ->> 'work' IS NOT NULL
              `,
              [res.companyId]
            );
            const allWorkEmails = getCompanyEmployeeEmails.map(emp => emp.workEmail);
            console.log(allWorkEmails)



            const getemployeeDetails = await this.employeeDetailsRepository.query(
              `
              SELECT 
                  "fullName" ->> 'first' AS "firstName",
                   "email" ->> 'work' AS "workEmail"
              FROM "hrm_employee_details"
              WHERE "employeeId" = $1
              `,
              [res.employeeId]
            );

            const shiftDate = new Date(request.shiftDate); // Convert to Date object
            const dayOfWeek = shiftDate.getDay(); // 0 (Sun) to 6 (Sat)

            // Adjust to get Monday as the start of the week
            const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;

            const weekStart = new Date(shiftDate);
            weekStart.setDate(shiftDate.getDate() + diffToMonday);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const weekStartDate = weekStart.toISOString().split('T')[0]; 
            const weekEndDate = weekEnd.toISOString().split('T')[0];    


     
            const workEmail = getemployeeDetails[0]?.workEmail;
            const employeeName = getemployeeDetails[0]?.firstName;
          
            const companyId = res.companyId
            const company = await this.APIService.getCompanyById(companyId);
            const dateObj = new Date(res.shiftDate); 
            const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' }); 
           const companyLogo = `${process.env.DOMAIN}/assets/romeohr_main.png`
            console.log(allWorkEmails)

          const dateOnly = new Date(request.shiftDate).toISOString().slice(0, 10);
            for (const emp of getCompanyEmployeeEmails) {
              const workEmail = emp.workEmail;
              const employeeName = emp.firstName;
            //console.log(request.shiftDate,res.shiftDate)
              
              const shiftUpdatdBody = await this.openShiftEmailTemplate(
                employeeName,
                weekStartDate,
                weekEndDate,
                company.companyName,
                day,
                dateOnly,
                res.startTime,
                res.endTime,
                process.env.DOMAIN,
                companyLogo
              );
            
              const emitBody = {
                sapCountType: 'OpenShift',
                companyId,
                subjects: 'Open Shift',
                email: [workEmail],
                body: shiftUpdatdBody
              };
            
              this.eventEmitter.emit('send.email', emitBody);
            }
            
            //console.log('employeeName',employeeName,'date',res.date,'company.companyName',company.companyName,res.date,'day',day, res.startTime,res.endTime)
            //const shiftUpdatdBody = await this.openShiftEmailTemplate(employeeName,weekStartDate,weekEndDate,company.companyName,day,shiftDate, res.startTime,res.endTime,process.env.DOMAIN,companyLogo);
            //const emitBody = { sapCountType:'OpenShift',companyId, subjects: 'Open Shift', email: allWorkEmails, body: shiftUpdatdBody};
      
            
          /*   console.log("before calling OPEN/APPROVE Roster shift")
            this.eventEmitter.emit('send.email', emitBody);
            console.log("after calling OPEN/APPROVE Roster shift") */
            
        } else if (req.status === "REJECTED") {
            console.log("OPEN REJECTED");
            request.status = req.status;
            await this.shiftRequestsRepo.save(request);
            
        }
        break;
        
    case "APPLY":
        console.log("APPLY APPROVED");
   
        request.openShiftRequests = [...(request.openShiftRequests || []), req.employeeId];
        
        await this.shiftRequestsRepo.save(request);
        break;
        
    case "SWAP":
        if (req.status === "APPROVED") {
            console.log("SWAP APPROVED");
            
            request.status = req.status
            await this.shiftRequestsRepo.save(request);
            shift.employeeId = req.employeeId;
            shift.isOpen = false;
            await this.rosterShiftsRepository.save(shift);

            const shiftDate = new Date(request.shiftDate); // Convert to Date object
            const dayOfWeek = shiftDate.getDay(); // 0 (Sun) to 6 (Sat)

            // Adjust to get Monday as the start of the week
            const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;

            const weekStart = new Date(shiftDate);
            weekStart.setDate(shiftDate.getDate() + diffToMonday);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const weekStartDate = weekStart.toISOString().split('T')[0]; 
            const weekEndDate = weekEnd.toISOString().split('T')[0];    
            const getemployeeDetails = await this.employeeDetailsRepository.query(
              `
              SELECT 
                  "fullName" ->> 'first' AS "firstName",
                   "email" ->> 'work' AS "workEmail"
              FROM "hrm_employee_details"
              WHERE "employeeId" = $1
              `,
              [req.employeeId]
            );
            
            const employeeName = getemployeeDetails[0]?.firstName;
            const employeeEmail = getemployeeDetails[0]?.workEmail;
            const dateObj = new Date(shift.date); 
            const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' }); 
            //const dateOnly = new Date(shift.date).toISOString().slice(0, 10);
           const companyLogo = `${process.env.DOMAIN}/assets/romeohr_main.png`
            console.log(employeeEmail)
            const shiftAssigned = await this.shiftAssignedEmailTemplate(employeeName,shift.date,company.companyName,weekStartDate,weekEndDate,day,shift.date, shift.startTime,shift.endTime,process.env.DOMAIN,companyLogo);
            const emitBody = { sapCountType:'OpenShift',companyId, subjects: 'Open Shift', email: employeeEmail, body: shiftAssigned};
      
            
            console.log("before calling SWAP/APPROVE Roster shift")
            this.eventEmitter.emit('send.email', emitBody);
            console.log("after calling SWAP/APPROVE Roster shift")


        } else if (req.status === "REJECTED") {
            console.log("SWAP REJECTED");
            request.status = req.status
            await this.shiftRequestsRepo.save(request);
        }
        break;
        
    default:
        console.log("Unknown request type:", request.type);
}

    await this.shiftRequestsRepo.save(request);
    }catch(error){
      console.log(error)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  
    

  }

  async openShiftEmailTemplate(
    name: string,
    Week_Start_Date: string,
    Week_End_Date:string,
    companyName: string,
    Day: string,
    Date: string,
    Starting_Time:string,
    Ending_Time:string,
    domain:string,
    companyLogo:string
  ) {
    //const dummy = await this.s3Service.getEmailTemplate("selfAccessGranted");
    const dummy = {
      openShift: `
       <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}

.bg { background: linear-gradient(135deg, #8b5cf6, #0edecd); border-radius: 12px 12px 0 0; padding: 20px; }
 

.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t85{padding:0 0 22px!important}.t103,.t70,.t81{text-align:center!important}.t102,.t69,.t7,.t80{vertical-align:top!important;width:600px!important}.t45,.t50{vertical-align:middle!important}.t51,.t8{text-align:left!important}.t5{border-top-left-radius:0!important;border-top-right-radius:0!important;padding-left:30px!important;padding-right:30px!important}.t67{border-bottom-right-radius:0!important;border-bottom-left-radius:0!important;padding:30px!important}.t111{mso-line-height-alt:20px!important;line-height:20px!important}.t3{width:44px!important}.t50{width:110px!important}.t45{width:600px!important}.t41{line-height:33px!important;mso-text-raise:6px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t114" style="min-width:100%;Margin:0px;padding:0px;background-color:#E0E0E0;"><div class="t113" style="background-color:#E0E0E0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t112" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#E0E0E0;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#E0E0E0"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t88" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="566" class="t87" style="width:566px;">
<table class="t86" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t85" style="padding:50px 10px 31px 10px;"><div class="t84" style="width:100%;text-align:center;"><div class="t83" style="display:inline-block;"><table class="t82" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t81"><td></td><td class="t80" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t79" style="width:100%;"><tr><td class="t78" style="background-color:transparent;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t15" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t14" style="width:600px;">
<table class="t13" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t12"><div class="t11" style="width:100%;text-align:left;"><div class="t10" style="display:inline-block;"><table class="t9" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t8"><td></td><td class="t7" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t6" style="width:100%;"><tr><td class="t5 bg" style="overflow:hidden;background-color:#CFD6FF;background-repeat:no-repeat;background-size:cover;background-position:center center;padding:20px 50px 20px 40px;border-radius:18px 18px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="185" class="t3" style="width:185px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="185" height="39.40828402366864" alt="" src="$companyLogo$"/></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t77" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t76" style="width:600px;">
<table class="t75" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t74"><div class="t73" style="width:100%;text-align:center;"><div class="t72" style="display:inline-block;"><table class="t71" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t70"><td></td><td class="t69" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t68" style="width:100%;"><tr><td class="t67" style="overflow:hidden;background-color:#F8F8F8;padding:40px 50px 40px 50px;border-radius:0 0 18px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t20" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t19" style="width:490px;">
<table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h1 class="t16" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:30px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">Now Scheduling: Open Shift</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t25" style="width:708px;">
<table class="t24" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t23"><p class="t22" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hi $name$,</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t33" style="width:708px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">We’ve got new open shift you can claim for the week of <span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Week_Start_Date$ to $Week_End_Date$</span> at <span class="t29" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Company_Name$</span>.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t35" style="mso-line-height-rule:exactly;mso-line-height-alt:39px;line-height:39px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t39" style="width:563px;">
<table class="t38" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t37"><p class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#3D51C4;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Available Shift</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t55" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="right">
<table class="t59" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;"><tr><td width="446" class="t58" style="width:600px;">
<table class="t57" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t56" style="border-bottom:1px solid #586CE0;padding:0 10px 0 10px;"><div class="t54" style="width:100%;text-align:left;"><div class="t53" style="display:inline-block;"><table class="t52" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle">
<tr class="t51"><td></td><td class="t45" width="360" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t43" style="width:100%;"><tr><td class="t42"><h1 class="t41" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:13px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:12px;">$Day$, $Date$ from $Starting_Time$ to $Ending_Time$</h1></td></tr></table>
<div class="t44" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td><td class="t50" width="66" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t48" style="width:100%;"><tr><td class="t47" style="overflow:hidden;background-color:#ADBAFF;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:11px;padding:0 15px 0 15px;border-radius:40px 40px 40px 40px;"><a class="t46" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:9px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#433869;text-align:center;mso-line-height-rule:exactly;mso-text-raise:11px;" target="_blank">View</a></td></tr></table>
<div class="t49" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t61" style="mso-line-height-rule:exactly;mso-line-height-alt:47px;line-height:47px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t65" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="234" class="t64" style="width:234px;">
<table class="t63" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t62" style="overflow:hidden;background-color:#586CE0;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;padding:0 30px 0 30px;border-radius:40px 40px 40px 40px;"><a class="t60" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">go to romeoHR</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t66" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t110" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t109" style="width:600px;">
<table class="t108" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t107"><div class="t106" style="width:100%;text-align:center;"><div class="t105" style="display:inline-block;"><table class="t104" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t103"><td></td><td class="t102" width="600" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t101" style="width:100%;"><tr><td class="t100" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t93" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t92" style="width:420px;">
<table class="t91" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t90"><p class="t89" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">81-83, Campbell Street, SURRY HILLS, NSW 2010, Australia</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t95" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t99" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t98" style="width:420px;">
<table class="t97" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t96"><p class="t94" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">contact@romeohr.com</p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
      `
    }; 
    let body = dummy["openShift"];
   
    const replacements = {
      "$name$": name,
      "$Week_Start_Date$":Week_Start_Date,
      "$Week_End_Date$":Week_End_Date,
      "$Company_Name$": companyName,
      "$Day$": Day,
      "$Date$": Date,
      "$Starting_Time$":Starting_Time,
      "$Ending_Time$":Ending_Time,
      "$domain$":domain,
      "$companyLogo$": companyLogo
     
      
    }
    body = body.replace(/\$(.*?)\$/g, (match) => {
      return replacements[match] || match;
    });
    return body;
  }


  async dropShift(
    name: string,
    Shift_Opened_Date: string,
    companyName: string,
    domain:string,
    companyLogo:string
  ) {
    //const dummy = await this.s3Service.getEmailTemplate("selfAccessGranted");
    const dummy = {
      dropShift: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}

.bg { background: linear-gradient(135deg, #8b5cf6, #0edecd); border-radius: 12px 12px 0 0; padding: 20px; }
 

.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t85{padding:0 0 22px!important}.t103,.t70,.t81{text-align:center!important}.t102,.t69,.t7,.t80{vertical-align:top!important;width:600px!important}.t45,.t50{vertical-align:middle!important}.t51,.t8{text-align:left!important}.t5{border-top-left-radius:0!important;border-top-right-radius:0!important;padding-left:30px!important;padding-right:30px!important}.t67{border-bottom-right-radius:0!important;border-bottom-left-radius:0!important;padding:30px!important}.t111{mso-line-height-alt:20px!important;line-height:20px!important}.t3{width:44px!important}.t50{width:110px!important}.t45{width:600px!important}.t41{line-height:33px!important;mso-text-raise:6px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t114" style="min-width:100%;Margin:0px;padding:0px;background-color:#E0E0E0;"><div class="t113" style="background-color:#E0E0E0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t112" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#E0E0E0;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#E0E0E0"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t88" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="566" class="t87" style="width:566px;">
<table class="t86" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t85" style="padding:50px 10px 31px 10px;"><div class="t84" style="width:100%;text-align:center;"><div class="t83" style="display:inline-block;"><table class="t82" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t81"><td></td><td class="t80" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t79" style="width:100%;"><tr><td class="t78" style="background-color:transparent;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t15" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t14" style="width:600px;">
<table class="t13" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t12"><div class="t11" style="width:100%;text-align:left;"><div class="t10" style="display:inline-block;"><table class="t9" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t8"><td></td><td class="t7" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t6" style="width:100%;"><tr><td class="t5 bg" style="overflow:hidden;background-color:#CFD6FF;background-repeat:no-repeat;background-size:cover;background-position:center center;padding:20px 50px 20px 40px;border-radius:18px 18px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="185" class="t3" style="width:185px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="185" height="39.40828402366864" alt="" src="$companyLogo$"/></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t77" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t76" style="width:600px;">
<table class="t75" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t74"><div class="t73" style="width:100%;text-align:center;"><div class="t72" style="display:inline-block;"><table class="t71" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t70"><td></td><td class="t69" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t68" style="width:100%;"><tr><td class="t67" style="overflow:hidden;background-color:#F8F8F8;padding:40px 50px 40px 50px;border-radius:0 0 18px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t20" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t19" style="width:490px;">
<table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h1 class="t16" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:30px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;"><span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;color: #007531;">Approved: </span> Drop Shift</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t25" style="width:708px;">
<table class="t24" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t23"><p class="t22" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hi $name$,</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t33" style="width:708px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Your request to drop the shift for the date of <span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Shift_Opened_Date$</span> at <span class="t29" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Company_Name$</span> has been approved.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t35" style="mso-line-height-rule:exactly;mso-line-height-alt:39px;line-height:39px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t39" style="width:563px;">
<table class="t38" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t37"><p class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#3D51C4;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"></p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t55" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="right">
<table class="t59" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;"><tr><td width="446" class="t58" style="width:600px;">
<table class="t57" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr style="display: none;"><td class="t56" style="border-bottom:1px solid #586CE0;padding:0 10px 0 10px;"><div class="t54" style="width:100%;text-align:left;"><div class="t53" style="display:inline-block;"><table class="t52" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle">
<tr class="t51"><td></td><td class="t45" width="360" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t43" style="width:100%;"><tr><td class="t42"><h1 class="t41" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:13px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:12px;"></h1></td></tr></table>
<div class="t44" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td><td class="t50" width="66" valign="middle">

<div class="t49" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t61" style="mso-line-height-rule:exactly;mso-line-height-alt:47px;line-height:0px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t65" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="234" class="t64" style="width:234px;">
<table class="t63" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t62" style="overflow:hidden;background-color:#586CE0;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;padding:0 30px 0 30px;border-radius:40px 40px 40px 40px;"><a class="t60" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">go to romeoHR</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t66" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t110" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t109" style="width:600px;">
<table class="t108" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t107"><div class="t106" style="width:100%;text-align:center;"><div class="t105" style="display:inline-block;"><table class="t104" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t103"><td></td><td class="t102" width="600" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t101" style="width:100%;"><tr><td class="t100" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t93" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t92" style="width:420px;">
<table class="t91" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t90"><p class="t89" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">81-83, Campbell Street, SURRY HILLS, NSW 2010, Australia</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t95" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t99" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t98" style="width:420px;">
<table class="t97" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t96"><p class="t94" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">contact@romeohr.com</p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
      `
    }; 
    let body = dummy["dropShift"];
   
    const replacements = {
      "$name$": name,
      "$Shift_Opened_Date$":Shift_Opened_Date,
      "$Company_Name$": companyName,
      "$domain$":domain,
      "$companyLogo$": companyLogo
      
    }
    body = body.replace(/\$(.*?)\$/g, (match) => {
      return replacements[match] || match;
    });
    return body;
  }

  async shiftAssignedEmailTemplate(
    name: string,
    Shift_Opened_Date: string,
    companyName: string,
    Week_Start_Date:string,
    Week_End_Date:string,
    Day: string,
    Date: string,
    Starting_Time:string,
    Ending_Time:string,
    domain:string,
    companyLogo:string
  ) {
    //const dummy = await this.s3Service.getEmailTemplate("selfAccessGranted");
    const dummy = {
      shiftAssigned: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}

.bg { background: linear-gradient(135deg, #8b5cf6, #0edecd); border-radius: 12px 12px 0 0; padding: 20px; }
 

.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t85{padding:0 0 22px!important}.t103,.t70,.t81{text-align:center!important}.t102,.t69,.t7,.t80{vertical-align:top!important;width:600px!important}.t45,.t50{vertical-align:middle!important}.t51,.t8{text-align:left!important}.t5{border-top-left-radius:0!important;border-top-right-radius:0!important;padding-left:30px!important;padding-right:30px!important}.t67{border-bottom-right-radius:0!important;border-bottom-left-radius:0!important;padding:30px!important}.t111{mso-line-height-alt:20px!important;line-height:20px!important}.t3{width:44px!important}.t50{width:110px!important}.t45{width:600px!important}.t41{line-height:33px!important;mso-text-raise:6px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t114" style="min-width:100%;Margin:0px;padding:0px;background-color:#E0E0E0;"><div class="t113" style="background-color:#E0E0E0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t112" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#E0E0E0;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#E0E0E0"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t88" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="566" class="t87" style="width:566px;">
<table class="t86" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t85" style="padding:50px 10px 31px 10px;"><div class="t84" style="width:100%;text-align:center;"><div class="t83" style="display:inline-block;"><table class="t82" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t81"><td></td><td class="t80" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t79" style="width:100%;"><tr><td class="t78" style="background-color:transparent;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t15" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t14" style="width:600px;">
<table class="t13" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t12"><div class="t11" style="width:100%;text-align:left;"><div class="t10" style="display:inline-block;"><table class="t9" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t8"><td></td><td class="t7" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t6" style="width:100%;"><tr><td class="t5 bg" style="overflow:hidden;background-color:#CFD6FF;background-repeat:no-repeat;background-size:cover;background-position:center center;padding:20px 50px 20px 40px;border-radius:18px 18px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="185" class="t3" style="width:185px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="185" height="39.40828402366864" alt="" src="$companyLogo$"/></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t77" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t76" style="width:600px;">
<table class="t75" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t74"><div class="t73" style="width:100%;text-align:center;"><div class="t72" style="display:inline-block;"><table class="t71" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t70"><td></td><td class="t69" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t68" style="width:100%;"><tr><td class="t67" style="overflow:hidden;background-color:#F8F8F8;padding:40px 50px 40px 50px;border-radius:0 0 18px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t20" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t19" style="width:490px;">
<table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h1 class="t16" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:30px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">Shift Assigned: on $Shift_Opened_Date$</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t25" style="width:708px;">
<table class="t24" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t23"><p class="t22" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hi $name$,</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t33" style="width:708px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Good news! You’ve been assigned a shift for the week of <span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Week_Start_Date$ to $Week_End_Date$</span> at <span class="t29" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Company_Name$</span>.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t35" style="mso-line-height-rule:exactly;mso-line-height-alt:39px;line-height:39px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t39" style="width:563px;">
<table class="t38" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t37"><p class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#3D51C4;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Assigned Shift Details</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t55" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="right">
<table class="t59" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;"><tr><td width="446" class="t58" style="width:600px;">
<table class="t57" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t56" style="border-bottom:1px solid #586CE0;padding:0 10px 0 10px;"><div class="t54" style="width:100%;text-align:left;"><div class="t53" style="display:inline-block;"><table class="t52" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle">
<tr class="t51"><td></td><td class="t45" width="360" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t43" style="width:100%;"><tr><td class="t42"><h1 class="t41" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:13px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:12px;">$Day$, $Date$ from $Starting_Time$ to $Ending_Time$</h1></td></tr></table>
<div class="t44" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td><td class="t50" width="66" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t48" style="width:100%;"><tr><td class="t47" style="overflow:hidden;background-color:#ADBAFF;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:11px;padding:0 15px 0 15px;border-radius:40px 40px 40px 40px;"><a class="t46" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:9px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#433869;text-align:center;mso-line-height-rule:exactly;mso-text-raise:11px;" target="_blank">View</a></td></tr></table>
<div class="t49" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t61" style="mso-line-height-rule:exactly;mso-line-height-alt:47px;line-height:47px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t65" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="234" class="t64" style="width:234px;">
<table class="t63" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t62" style="overflow:hidden;background-color:#586CE0;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;padding:0 30px 0 30px;border-radius:40px 40px 40px 40px;"><a class="t60" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">go to romeoHR</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t66" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t110" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t109" style="width:600px;">
<table class="t108" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t107"><div class="t106" style="width:100%;text-align:center;"><div class="t105" style="display:inline-block;"><table class="t104" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t103"><td></td><td class="t102" width="600" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t101" style="width:100%;"><tr><td class="t100" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t93" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t92" style="width:420px;">
<table class="t91" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t90"><p class="t89" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">81-83, Campbell Street, SURRY HILLS, NSW 2010, Australia</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t95" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t99" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t98" style="width:420px;">
<table class="t97" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t96"><p class="t94" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">contact@romeohr.com</p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
      `
    }; 
    let body = dummy["shiftAssigned"];
   
    const replacements = {
      "$name$": name,
      "$Shift_Opened_Date$":Shift_Opened_Date,
      "$Company_Name$": companyName,
      "$Week_Start_Date$": Week_Start_Date,
      "$Week_End_Date$":Week_End_Date,
      "$Day$": Day,
      "$Date$": Date,
      "$Starting_Time$": Starting_Time,
      "$Ending_Time$": Ending_Time,
      "$domain$":domain,
      "$companyLogo$": companyLogo
      
    }
    body = body.replace(/\$(.*?)\$/g, (match) => {
      return replacements[match] || match;
    });
    return body;
  }


  async rejectedDropShift(
    name: string,
    Shift_Opened_Date: string,
    companyName: string,
    domain:string,
    companyLogo:string
  ) {
    //const dummy = await this.s3Service.getEmailTemplate("selfAccessGranted");
    const dummy = {
      rejectedDropShift: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}

.bg { background: linear-gradient(135deg, #8b5cf6, #0edecd); border-radius: 12px 12px 0 0; padding: 20px; }
 

.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t85{padding:0 0 22px!important}.t103,.t70,.t81{text-align:center!important}.t102,.t69,.t7,.t80{vertical-align:top!important;width:600px!important}.t45,.t50{vertical-align:middle!important}.t51,.t8{text-align:left!important}.t5{border-top-left-radius:0!important;border-top-right-radius:0!important;padding-left:30px!important;padding-right:30px!important}.t67{border-bottom-right-radius:0!important;border-bottom-left-radius:0!important;padding:30px!important}.t111{mso-line-height-alt:20px!important;line-height:20px!important}.t3{width:44px!important}.t50{width:110px!important}.t45{width:600px!important}.t41{line-height:33px!important;mso-text-raise:6px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t114" style="min-width:100%;Margin:0px;padding:0px;background-color:#E0E0E0;"><div class="t113" style="background-color:#E0E0E0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t112" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#E0E0E0;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#E0E0E0"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t88" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="566" class="t87" style="width:566px;">
<table class="t86" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t85" style="padding:50px 10px 31px 10px;"><div class="t84" style="width:100%;text-align:center;"><div class="t83" style="display:inline-block;"><table class="t82" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t81"><td></td><td class="t80" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t79" style="width:100%;"><tr><td class="t78" style="background-color:transparent;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t15" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t14" style="width:600px;">
<table class="t13" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t12"><div class="t11" style="width:100%;text-align:left;"><div class="t10" style="display:inline-block;"><table class="t9" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t8"><td></td><td class="t7" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t6" style="width:100%;"><tr><td class="t5 bg" style="overflow:hidden;background-color:#CFD6FF;background-repeat:no-repeat;background-size:cover;background-position:center center;padding:20px 50px 20px 40px;border-radius:18px 18px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="185" class="t3" style="width:185px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="185" height="39.40828402366864" alt="" src="$companyLogo$"/></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t77" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t76" style="width:600px;">
<table class="t75" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t74"><div class="t73" style="width:100%;text-align:center;"><div class="t72" style="display:inline-block;"><table class="t71" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t70"><td></td><td class="t69" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t68" style="width:100%;"><tr><td class="t67" style="overflow:hidden;background-color:#F8F8F8;padding:40px 50px 40px 50px;border-radius:0 0 18px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t20" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t19" style="width:490px;">
<table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h1 class="t16" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:30px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;"><span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;color: #a8003b;">Rejected: </span> Drop Shift</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t25" style="width:708px;">
<table class="t24" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t23"><p class="t22" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hi $name$,</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t33" style="width:708px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">We regret to inform that your request to drop the shift for the date of <span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Shift_Opened_Date$</span> at <span class="t29" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Company_Name$</span> has been rejected.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t35" style="mso-line-height-rule:exactly;mso-line-height-alt:39px;line-height:39px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t39" style="width:563px;">
<table class="t38" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t37"><p class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#3D51C4;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;"></p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t55" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="right">
<table class="t59" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;"><tr><td width="446" class="t58" style="width:600px;">
<table class="t57" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr style="display: none;"><td class="t56" style="border-bottom:1px solid #586CE0;padding:0 10px 0 10px;"><div class="t54" style="width:100%;text-align:left;"><div class="t53" style="display:inline-block;"><table class="t52" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle">
<tr class="t51"><td></td><td class="t45" width="360" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t43" style="width:100%;"><tr><td class="t42"><h1 class="t41" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:13px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:12px;"></h1></td></tr></table>
<div class="t44" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td><td class="t50" width="66" valign="middle">
<div class="t49" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t61" style="mso-line-height-rule:exactly;mso-line-height-alt:47px;line-height:0px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t65" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="234" class="t64" style="width:234px;">
<table class="t63" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t62" style="overflow:hidden;background-color:#586CE0;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;padding:0 30px 0 30px;border-radius:40px 40px 40px 40px;"><a class="t60" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">go to romeoHR</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t66" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t110" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t109" style="width:600px;">
<table class="t108" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t107"><div class="t106" style="width:100%;text-align:center;"><div class="t105" style="display:inline-block;"><table class="t104" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t103"><td></td><td class="t102" width="600" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t101" style="width:100%;"><tr><td class="t100" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t93" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t92" style="width:420px;">
<table class="t91" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t90"><p class="t89" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">81-83, Campbell Street, SURRY HILLS, NSW 2010, Australia</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t95" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t99" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t98" style="width:420px;">
<table class="t97" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t96"><p class="t94" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">contact@romeohr.com</p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
      `
    }; 
    let body = dummy["rejectedDropShift"];
   
    const replacements = {
      "$name$": name,
      "$Shift_Opened_Date$":Shift_Opened_Date,
      "$Company_Name$": companyName,
      "$domain$":domain,
      "$companyLogo$": companyLogo
      
    }
    body = body.replace(/\$(.*?)\$/g, (match) => {
      return replacements[match] || match;
    });
    return body;
  }
  
  async dropShiftRequestAdmin(
    Employee_Name: string,
    Shift_Opened_Date: string,
    Week_Start_Date:string,
    Week_End_Date:string,
    companyName: string,
    Day: string,
    Date: Date,
    Starting_Time:string,
    Ending_Time:string,
    domain:string,
    companyLogo:string
  ) {
    //const dummy = await this.s3Service.getEmailTemplate("selfAccessGranted");
    const dummy = {
      dropShiftRequestAdmin: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}

.bg { background: linear-gradient(135deg, #8b5cf6, #0edecd); border-radius: 12px 12px 0 0; padding: 20px; }
 

.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
line-height: inherit;
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t85{padding:0 0 22px!important}.t103,.t70,.t81{text-align:center!important}.t102,.t69,.t7,.t80{vertical-align:top!important;width:600px!important}.t45,.t50{vertical-align:middle!important}.t51,.t8{text-align:left!important}.t5{border-top-left-radius:0!important;border-top-right-radius:0!important;padding-left:30px!important;padding-right:30px!important}.t67{border-bottom-right-radius:0!important;border-bottom-left-radius:0!important;padding:30px!important}.t111{mso-line-height-alt:20px!important;line-height:20px!important}.t3{width:44px!important}.t50{width:110px!important}.t45{width:600px!important}.t41{line-height:33px!important;mso-text-raise:6px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t114" style="min-width:100%;Margin:0px;padding:0px;background-color:#E0E0E0;"><div class="t113" style="background-color:#E0E0E0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t112" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#E0E0E0;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#E0E0E0"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t88" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="566" class="t87" style="width:566px;">
<table class="t86" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t85" style="padding:50px 10px 31px 10px;"><div class="t84" style="width:100%;text-align:center;"><div class="t83" style="display:inline-block;"><table class="t82" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t81"><td></td><td class="t80" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t79" style="width:100%;"><tr><td class="t78" style="background-color:transparent;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t15" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t14" style="width:600px;">
<table class="t13" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t12"><div class="t11" style="width:100%;text-align:left;"><div class="t10" style="display:inline-block;"><table class="t9" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t8"><td></td><td class="t7" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t6" style="width:100%;"><tr><td class="t5 bg" style="overflow:hidden;background-color:#CFD6FF;background-repeat:no-repeat;background-size:cover;background-position:center center;padding:20px 50px 20px 40px;border-radius:18px 18px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="185" class="t3" style="width:185px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="185" height="39.40828402366864" alt="" src="$companyLogo$"/></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t77" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t76" style="width:600px;">
<table class="t75" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t74"><div class="t73" style="width:100%;text-align:center;"><div class="t72" style="display:inline-block;"><table class="t71" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t70"><td></td><td class="t69" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t68" style="width:100%;"><tr><td class="t67" style="overflow:hidden;background-color:#F8F8F8;padding:40px 50px 40px 50px;border-radius:0 0 18px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="left">
<table class="t20" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t19" style="width:490px;">
<table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h1 class="t16" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:30px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">Drop Shift Request: $Employee_Name$</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t25" style="width:708px;">
</td></tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t33" style="width:708px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Employee_Name$ </span> has requested to drop the shift for the week of <span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Week_Start_Date$ to $Week_End_Date$</span> at <span class="t29" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$Company_Name$</span>.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t35" style="mso-line-height-rule:exactly;mso-line-height-alt:39px;line-height:39px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t39" style="width:563px;">
<table class="t38" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t37"><p class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#3D51C4;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Shift Details</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t55" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="right">
<table class="t59" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;"><tr><td width="446" class="t58" style="width:600px;">
<table class="t57" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t56" style="border-bottom:1px solid #586CE0;padding:0 10px 0 10px;"><div class="t54" style="width:100%;text-align:left;"><div class="t53" style="display:inline-block;"><table class="t52" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle">
<tr class="t51"><td></td><td class="t45" width="360" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t43" style="width:100%;"><tr><td class="t42"><h1 class="t41" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:13px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:12px;">$Day$, $Date$ from $Starting_Time$ to $Ending_Time$</h1></td></tr></table>
<div class="t44" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td><td class="t50" width="66" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t48" style="width:100%;"><tr><td class="t47" style="overflow:hidden;background-color:#ADBAFF;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:11px;padding:0 15px 0 15px;border-radius:40px 40px 40px 40px;"><a class="t46" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:9px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#433869;text-align:center;mso-line-height-rule:exactly;mso-text-raise:11px;" target="_blank">View</a></td></tr></table>
<div class="t49" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t61" style="mso-line-height-rule:exactly;mso-line-height-alt:47px;line-height:47px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t65" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="234" class="t64" style="width:234px;">
<table class="t63" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t62" style="overflow:hidden;background-color:#586CE0;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;padding:0 30px 0 30px;border-radius:40px 40px 40px 40px;"><a class="t60" href="$domain$" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">go to romeoHR</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t66" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t110" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t109" style="width:600px;">
<table class="t108" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t107"><div class="t106" style="width:100%;text-align:center;"><div class="t105" style="display:inline-block;"><table class="t104" role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top">
<tr class="t103"><td></td><td class="t102" width="600" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t101" style="width:100%;"><tr><td class="t100" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t93" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t92" style="width:420px;">
<table class="t91" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t90"><p class="t89" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">81-83, Campbell Street, SURRY HILLS, NSW 2010, Australia</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t95" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t99" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="420" class="t98" style="width:420px;">
<table class="t97" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t96"><p class="t94" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">contact@romeohr.com</p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t111" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
      `
    }; 
    let body = dummy["dropShiftRequestAdmin"];
   
    const replacements = {
      "$Employee_Name$": Employee_Name,
      "$Shift_Opened_Date$":Shift_Opened_Date,
      "$Company_Name$": companyName,
      "$Week_Start_Date$": Week_Start_Date,
      "$Week_End_Date$":Week_End_Date,
      "$Day$": Day,
      "$Date$": Date,
      "$Starting_Time$": Starting_Time,
      "$Ending_Time$": Ending_Time,
      "$domain$":domain,
      "$companyLogo$": companyLogo
      
    }
    body = body.replace(/\$(.*?)\$/g, (match) => {
      return replacements[match] || match;
    });
    return body;
  }

  

  
}

