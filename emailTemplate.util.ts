import { HttpException, HttpStatus } from "@nestjs/common";
import * as AWS from 'aws-sdk';

export async function getProcessedTemplate(templateType: string, replacements: Record<string, string | number>): Promise<string> {
  try {
    let body;
    const timeLogTemplates = {
      timeLogApproved: [`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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

.bg {
    background: linear-gradient(135deg, #8b5cf6, #0edecd);
    border-radius: 12px 12px 0 0;
    padding: 20px;
}

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
<table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h1 class="t16" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:30px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;"><span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;color: #007531;">Approved: </span> Time Log Request</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t25" style="width:708px;">
<table class="t24" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t23"><p class="t22" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hi $employeeName$,</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t33" style="width:708px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Your request of the time log for the date of <span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$date$</span> at <span class="t29" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$companyName$</span> has been approved.</p></td></tr></table>
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
</html>`],
      timeLogRejected: [`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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

.bg {
    background: linear-gradient(135deg, #8b5cf6, #0edecd);
    border-radius: 12px 12px 0 0;
    padding: 20px;
}

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
<table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h1 class="t16" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:30px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;"><span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;color: #a8003b;">Rejected: </span> Time Log Request</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t25" style="width:708px;">
<table class="t24" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t23"><p class="t22" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Hi $employeeName$,</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t33" style="width:708px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">We regret to inform that your request of the time log for the date of <span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$date$</span> at <span class="t29" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$companyName$</span> has been rejected.</p></td></tr></table>
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
</html>`],
      timeLogRequest: [`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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

.bg {
    background: linear-gradient(135deg, #8b5cf6, #0edecd);
    border-radius: 12px 12px 0 0;
    padding: 20px;
}

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
<table class="t18" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t17"><h1 class="t16" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:30px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">Time Log Request: $date$</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t26" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t25" style="width:708px;">
</td></tr></table>
</td></tr><tr><td><div class="t27" style="mso-line-height-rule:exactly;mso-line-height-alt:15px;line-height:15px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t34" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t33" style="width:708px;">
<table class="t32" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t31"><p class="t30" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$employeeName$ </span> has requested the time log for the date of <span class="t28" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$date$</span> at <span class="t29" style="margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly;">$companyName$</span>.</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t35" style="mso-line-height-rule:exactly;mso-line-height-alt:39px;line-height:39px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t40" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t39" style="width:563px;">
<table class="t38" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t37"><p class="t36" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#3D51C4;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px;">Shift Details</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t55" style="mso-line-height-rule:exactly;mso-line-height-alt:10px;line-height:10px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="right">
<table class="t59" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;"><tr><td width="446" class="t58" style="width:600px;">
<table class="t57" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t56" style="border-bottom:1px solid #586CE0;padding:0 10px 0 10px;"><div class="t54" style="width:100%;text-align:left;"><div class="t53" style="display:inline-block;"><table class="t52" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="middle">
<tr class="t51"><td></td><td class="t45" width="360" valign="middle">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t43" style="width:100%;"><tr><td class="t42"><h1 class="t41" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:13px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:12px;">$day$, $date$ from $startTime$ to $endTime$</h1></td></tr></table>
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
</html>`]
    };
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_KEY_SECRET,
      });
    const params = {
      Bucket: process.env.RESOURCE_BUCKET_NAME,
      Key: process.env.EMAIL_TEMPLATE_FILE,
    };

    if (templateType === 'timeLogApproved' || templateType === 'timeLogRejected' || templateType === 'timeLogRequest' ) {
      body = timeLogTemplates[templateType][0];
    }
    else {
      const data = await s3
        .getObject(params)
        .promise()
        .then((data) => JSON.parse(data.Body.toString()));

      body = data[templateType][0];
    }
    
    // Replace all placeholders with actual values
    body = body.replace(/\$(.*?)\$/g, (match) => {
      return replacements[match] || match;
    });
    
    return body;
  } catch (error) {
    console.log(error);
    throw new HttpException('Error processing email template', HttpStatus.BAD_REQUEST);
  }
}

export async function timeLogTemplate(type, params): Promise<string> {
  return getProcessedTemplate(type, params);
}

export async function bookCallTemplate(fullName: string, username: string): Promise<string> {
  return getProcessedTemplate('BookCall', {
    "$fullName$": fullName
  });
}

export async function phoneVerificationTemplate(phoneNumber: string, companyName: string, companyId: string): Promise<string> {
  return getProcessedTemplate('PhoneVerification', {
    "$phoneNumber$": phoneNumber,
    "$companyName$": `${companyName} | id = {${companyId}}`,
    "$curl$": `curl -X GET "${process.env.CURL_DOMAIN}/app/v1/verify-phonenumber?companyId=${companyId}"`
  });
}

export async function welcomeTemplate(fullName: string, userName: string): Promise<string> {
  return getProcessedTemplate('WelcomeToHtml', {
    "$fullName$": fullName,
    "$username$": userName
  });
}

export async function changePasswordTemplate(changePasswordId: string, fullName: string, companyName: string): Promise<string> {
  return getProcessedTemplate('PasswordReset', {
    "$fullName$": fullName,
    "$domain$": process.env.DOMAIN,
    "$changePasswordId$": changePasswordId
  });
}

export async function accountCreationTemplate(firstName: string, username: string, password: string): Promise<string> {
  return getProcessedTemplate('AccountCreation', {
    "$firstName$": firstName,
    "$username$": username,
    "$pwd$": password
  });
}

export async function verificationTemplate(fullName: string, url: string): Promise<string> {
  return getProcessedTemplate('Verifying', {
    "$fullName$": fullName,
    "$url$": url
  });
}

export async function specialUserEmailTemplate(firstName: string, password: string, username: string): Promise<string> {
  return getProcessedTemplate('AccountCreation', {
    "$firstName$": firstName,
    "$username$": username,
    "$pwd$": password
  });
}

export async function selfAccessGrantedEmailTemplate(companyName: string, username: string): Promise<string> {
  return getProcessedTemplate('selfAccessGranted', {
    "$companyName$": companyName,
    "$userName$": username
  });
}

export async function selfAccessRevokedEmailTemplate(companyName: string, username: string): Promise<string> {
  return getProcessedTemplate('selfAccessRevoked', {
    "$companyName$": companyName,
    "$userName$": username
  });
}

export async function complianceEmailTemplate(complianceType: string, expiryDate: string, employeeName: string): Promise<string> {
  return getProcessedTemplate('complianceEmailTemplate', {
    "$complianceType$": complianceType,
    "$expiryDate$": expiryDate,
    "$employeeName$": employeeName
  });
}

export async function interviewEmailTemplate(
  companyName: string, 
  candidateName: string, 
  title: string, 
  date: string, 
  startTime: string, 
  meetingLink: string
): Promise<string> {
  return getProcessedTemplate('interview', {
    "$companyName$": companyName,
    "$candidateName$": candidateName,
    "$title$": title,
    "$date$": date,
    "$startTime$": startTime,
    "$meetingLink$": meetingLink
  });
}

export async function offerLetterEmailTemplate(
  companyName: string,
  candidateName: string,
  phoneNumber: string,
  name: string,
  jobRole: string,
  offerLetterId: string,
  companyId: string
): Promise<string> {
  return getProcessedTemplate('OfferLetter', {
    "$companyName$": companyName,
    "$candidateName$": candidateName,
    "$phoneNumber$": phoneNumber,
    "$name$": name,
    "$jobRole$": jobRole,
    "$id$": offerLetterId,
    "$process.env.DOMAIN$": process.env.DOMAIN,
    "$companyId$": companyId
  });
}

export async function leaveRequestTemplate(
  companyLogo: string,
  userName: string,
  msg: string,
  timeOff: string,
  requestDate: string,
  totalDays: number,
  usedDays: number,
  type: string
): Promise<string> {
  const remainingDays = totalDays - usedDays;
  const available = remainingDays < 0
    ? `<span style="color: red">${Math.abs(remainingDays)} ${Math.abs(remainingDays) !== 1 ? type + 's' : type} nopay</span>`
    : `<span>${remainingDays} ${remainingDays !== 1 ? type + 's' : type}</span>`;

  return getProcessedTemplate('leaveRequestTemplate', {
    "$companyLogo$": companyLogo,
    "$username$": userName,
    "$msg$": msg,
    "$timeOff$": timeOff,
    "$requestDate$": requestDate,
    "$available$": available
  });
}

export async function requestTemplate(
  type: string,
  userName: string,
  requesterName: string,
  employeeName: string,
  userName2: string,
  address: string,
  hireDate: string
): Promise<string> {
  const typeConfig = {
    employementStatusApproval: {
      heading: 'Employment Status Request',
      text: 'Employment Status Request',
      imageLink: 'https://assets.unlayer.com/projects/96893/1661228646923-706037.png'
    },
    jobInformationApproval: {
      heading: 'New Job Information Request',
      text: 'Job Information Request',
      imageLink: 'https://assets.unlayer.com/projects/96893/1661229048858-772707.png'
    },
    compensationApproval: {
      heading: 'New Compensation Request',
      text: 'Compensation Request',
      imageLink: 'https://assets.unlayer.com/projects/96893/1661228538779-695641.png'
    },
    promotionApproval: {
      heading: 'New Promotion Request',
      text: 'Promotion Request',
      imageLink: 'https://assets.unlayer.com/projects/96893/1661228461325-421451.png'
    }
  };

  const config = typeConfig[type] || { heading: '', text: '', imageLink: '' };

  return getProcessedTemplate('RequestTemplate', {
    "$imageLink$": config.imageLink,
    "$heading$": config.heading,
    "$userName$": userName,
    "$requesterName$": requesterName,
    "$text$": config.text,
    "$employeeName$": employeeName,
    "$userName2$": userName2,
    "$address$": address,
    "$hireDate$": hireDate
  });
}

export async function statusTemplate(
  status: string,
  type: string,
  requesterName: string,
  employeeName: string,
  headerUserName: string,
  userName2: string,
  date: string,
  status2: string
): Promise<string> {
  const typeMap = {
    employementStatus: 'Employment Status Request',
    jobInformation: 'Job Information Request',
    compensation: 'Compensation Request',
    promotion: 'Promotion Request'
  };

  const statusConfig = {
    approved: {
      imageLink: 'https://assets.unlayer.com/projects/96893/1661228883379-918296.png',
      Status: 'Approved'
    },
    denied: {
      imageLink: 'https://assets.unlayer.com/projects/96893/1661229007388-232125.png',
      Status: 'Denied'
    }
  };

  const heading = `${typeMap[type]} ${statusConfig[status]?.Status || ''}`;
  const text = status === 'approved'
    ? `Your ${heading} for ${employeeName} has been approved.`
    : `Your ${heading} for ${employeeName} has been denied by ${headerUserName}.`;

  return getProcessedTemplate('StatusTemplate', {
    "$imageLink$": statusConfig[status]?.imageLink || '',
    "$heading$": heading,
    "$requesterName$": requesterName,
    "$text$": text,
    "$userName2$": userName2,
    "$date$": date,
    "$Status$": statusConfig[status]?.Status || ''
  });
}

export async function coverUpRequestTemplate(
  coverupName: string,
  requesterName: string,
  daysLong: string,
  otherUsername: string,
  companyLogo: string,
  datePeriod: string,
  hours: string,
  vacation: string,
  status: string
): Promise<string> {
  return getProcessedTemplate('CoverRequestApproval', {
    "$coverupName$": coverupName,
    "$requesterName$": requesterName,
    "$daysLong$": daysLong,
    "$otherUsername$": otherUsername,
    "$companyLogo$": companyLogo,
    "$datePeriod$": datePeriod,
    "$hours$": hours,
    "$vacation$": vacation,
    "$status$": status
  });
}

export async function timeOffStatusTemplate(
  type: string,
  companyLogo: string,
  userName: string,
  userName2: string,
  hours: string,
  timeOff: string,
  datePeriod: string
): Promise<string> {
  const statusConfig = {
    approved: {
      text: `Your time off request for ${hours} of Vacation has been approved by ${userName2}`,
      headingVar: 'Approved',
      image: 'https://assets.unlayer.com/projects/96893/1661228104845-47755.png'
    },
    denied: {
      text: `${userName2} has denied your time off request.`,
      headingVar: 'Denied',
      image: 'https://assets.unlayer.com/projects/96893/1661229144310-135276.png'
    }
  };

  const config = statusConfig[type] || { text: '', headingVar: '', image: '' };

  return getProcessedTemplate('TimeOffrequestApproveOrDenied', {
    "$headingVar$": config.headingVar,
    "$userName$": userName,
    "$text$": config.text,
    "$datePeriod$": datePeriod
  });
}

export async function emailTemplate(
  templateType: string,
  userType: string,
  clientCompanyName: string,
  consultantName: string,
  companyEmail: string
): Promise<string> {
  return getProcessedTemplate(templateType, {
    "$userType$": userType,
    "$clientCompanyName$": clientCompanyName,
    "$consultantName$": consultantName,
    "$companyEmail$": companyEmail
  });
}
