import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
const fs = require('fs');
const moment = require('moment'); 


export async function generatePayslip({
  employee,
  values,
  range,
  payroll
}) {

  const deductions=values.totalDeductionArray;
    const earnings=values.totalAllowanceArray;
    const gross=values.grossSalary;
    const formattedDate = moment(payroll.createdAt).format('DD/MM/YYYY');


    const formattedRange = range
      ? `${moment(range[0]).format("YYYY/MM/DD")} - ${moment(range[1]).format("YYYY/MM/DD")}`
      : "N/A";


    
    const net=values.netSalary;
    const deductAmount = values.totalDeduction;
    const paye=values.paye
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([500, 700]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 650;
  const leftX = 40;
  const rightX = 400;
  const payRightX=350

  // Header
  page.drawText('Biz Solution', { x: leftX, y, size: 25, font: boldFont, color: rgb(0, 0.2, 0.6) });
  page.drawText('PAYSLIP', { x: payRightX, y, size: 18, font: boldFont });

  y -= 15;
  page.drawText('12, Low Level Road, Kaduwela, Sri Lanka', { x: leftX, y, size: 10, font });
  y -= 12;
  page.drawText('Phone: +112954862, Email: biz@provider.com', { x: leftX, y, size: 10, font });

  // Employee & Payroll Info
  y -= 30;
  page.drawText('Employee Details', { x: leftX, y, size: 15, font: boldFont, color: rgb(0.4, 0.4, 0.6) });
  y -= 15;
  page.drawText(`Full Name: ${employee.name}`, { x: leftX, y, size: 10, font });
  y -= 12;
  page.drawText(`Address: ${employee.address}`, { x: leftX, y, size: 10, font });
  y -= 12;
  page.drawText(`Phone: ${employee.telephone}`, { x: leftX, y, size: 10, font });
  y -= 12;
  page.drawText(`Email: ${employee.email}`, { x: leftX, y, size: 10, font });
  y -= 12;
  page.drawText(`Designation: ${employee.role}`, { x: leftX, y, size: 10, font });
  page.drawText(`Payroll Id :${payroll.id} `, { x: payRightX, y:y+105, size: 8, font: font });

  page.drawText(`Issued Date: ${formattedDate}`, { x: payRightX, y: y + 95, size: 8, font: font });
  page.drawText(`Pay Type: Cheque`, { x: payRightX, y: y + 85, size: 8, font: font });
  page.drawText(`Pay Period: ${formattedRange}`, { x: payRightX, y: y + 75, size: 8, font: font });

  // Earnings Table
  y -= 40;
  const tableStartY = y;
  const colX = [leftX, 400, 800];
  const headers = ['EARNINGS', 'Value'];
  headers.forEach((h, i) => page.drawText(h, { x: colX[i], y, font: boldFont, size: 13 }));
  y -= 20;
  page.drawText('Basic Salary', { x: colX[0], y, size: 10, font: boldFont });
  page.drawText(employee.salary.toFixed(2), { x: colX[1], y, size: 10, font });

  earnings.forEach((item, idx) => {
    y -= 15;
    page.drawText(item.label, { x: colX[0], y, size: 9, font });
    page.drawText(item.amount.toFixed(2), { x: colX[1], y, size: 9, font });
  });
  y -= 25;
  page.drawText('PAYE Salary', { x: colX[0], y, size: 10, font: boldFont });
  page.drawText(gross.toFixed(2), { x: colX[1], y, size: 10, font });

  y -= 15;
  page.drawText('Gross Salary', { x: colX[0], y, size: 10, font: boldFont });
  page.drawText(gross.toFixed(2), { x: colX[1], y, size: 10, font });

  // Deductions Table
  y -= 40;
  page.drawText('DEDUCTIONS', { x: colX[0], y, font: boldFont, size: 13 });
  deductions.forEach((item) => {
    y -= 15;
    page.drawText(item.label, { x: colX[0], y, size: 9, font });
    page.drawText(item.amount.toFixed(2), { x: colX[1], y, size: 9, font });
  });
  y -= 15;
  page.drawText('Paye Tax', { x: colX[0], y, size: 10, font: boldFont });
  page.drawText(paye.toFixed(2), { x: colX[1], y, size: 10, font });


  y -= 15;
  page.drawText('TOTAL DEDUCTIONS', { x: colX[0], y, size: 10, font: boldFont });
  page.drawText((deductAmount+paye).toFixed(2), { x: colX[1], y, size: 10, font });

  y -= 15; 
page.drawLine({
  start: { x: leftX, y }, // Starting point of the line
  end: { x: 470, y }, // Ending point of the line (adjust `x` as needed)
  thickness: 1, // Thickness of the line
  color: rgb(0, 0, 0), // Line color (black in this case)
});

  y -= 30;
  page.drawText('Net Salary', { x: colX[0], y, size: 12, font: boldFont });
  page.drawText(net.toFixed(2), { x: colX[1], y, size: 12, font: boldFont });

  y -= 40;
  page.drawText('Company Contributions:', { x: leftX, y, size: 12, font: boldFont });
y-=20;
page.drawText('EPF 12% -', { x: leftX, y, size: 9, font: font });
page.drawText(((employee.salary)*12/100).toFixed(2), { x: leftX+45, y, size: 9, font: font });

page.drawText('ETF 3% - ', { x: leftX+200, y, size: 9, font: font });
page.drawText(((employee.salary)*3/100).toFixed(2), { x: leftX+240, y, size: 9, font: font });


  y -= 40;
  page.drawText('If you have any questions about this payslip, please contact:', { x: leftX, y, size: 10, font });
  y -= 12;
  page.drawText(`${employee.name}, ${employee.telephone}, ${employee.email}`, { x: leftX, y, size: 10, font });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(`C:/Users/USER/Downloads/Payrolls/${employee.id}.pdf`, pdfBytes);
}






