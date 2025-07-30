import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
const fs = require('fs');
const moment = require('moment');

/**
 * @param firebaseService - instance of your FirebaseService
 */
export async function generatePayslip({
  employee,
  values,
  payroll,
  employerFundRate,
  ETF,
  month,
  firebaseService, 
}) {
  const deductions = values.totalDeductionArray;
  const earnings = values.totalAllowanceArray;
  const gross = values.grossSalary;
  const formattedDate = moment(payroll.createdAt).format('DD/MM/YYYY');
  const net = values.netSalary;
  const deductAmount = values.totalDeduction;
  const paye = values.payeTax;
  const pdfDoc = await PDFDocument.create();

  //PDF Meta Data
  pdfDoc.setTitle(`Payslip - ${employee.id}`);
  pdfDoc.setAuthor('Biz Solution Payroll System');
  pdfDoc.setSubject('Monthly Payslip');
  pdfDoc.setProducer('Biz Solution');
  pdfDoc.setCreationDate(new Date(payroll.createdAt));

  //PDF Dimensions
  const lineHeight = 15;
  const height =
    550 + deductions.length * lineHeight + earnings.length * lineHeight;
  const width = 500;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let y = height - 50;
  const leftX = 40;
  const payRightX = 350;
  const page = pdfDoc.addPage([width, height]);

  // Header
  page.drawText('EmpSync Solution', {
    x: leftX,
    y,
    size: 25,
    font: boldFont,
    color: rgb(0, 0.2, 0.6),
  });
  page.drawText('PAYSLIP', { x: payRightX, y, size: 15, font: boldFont });

  y -= lineHeight;
  page.drawText('12, Low Level Road, Kaduwela, Sri Lanka', {
    x: leftX,
    y,
    size: 10,
    font,
  });
  y -= lineHeight;
  page.drawText('Phone: +112954862, Email: emp@provider.com', {
    x: leftX,
    y,
    size: 10,
    font,
  });

  // Employee & Payroll Info
  y -= 40;
  page.drawText('Employee Details', {
    x: leftX,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.6),
  });
  y -= lineHeight;
  page.drawText(`Full Name: ${employee.name}`, { x: leftX, y, size: 10, font });
  y -= 12;
  page.drawText(`Address: ${employee.address}`, {
    x: leftX,
    y,
    size: 10,
    font,
  });
  y -= 12;
  page.drawText(`Phone: ${employee.telephone}`, {
    x: leftX,
    y,
    size: 10,
    font,
  });
  y -= 12;
  page.drawText(`Email: ${employee.email}`, { x: leftX, y, size: 10, font });
  y -= 12;
  page.drawText(`Designation: ${employee.role}`, {
    x: leftX,
    y,
    size: 10,
    font,
  });
  page.drawText(`Payroll Id :${payroll.id} `, {
    x: payRightX,
    y: y + 123,
    size: 8,
    font: font,
  });

  page.drawText(`Issued Date: ${formattedDate}`, {
    x: payRightX,
    y: y + 113,
    size: 8,
    font: font,
  });
  page.drawText(`Pay Type: Cheque`, {
    x: payRightX,
    y: y + 103,
    size: 8,
    font: font,
  });
  page.drawText(`Pay Month: ${month}`, {
    x: payRightX,
    y: y + 93,
    size: 8,
    font: font,
  });

  // Earnings Table
  y -= 40;
  const tableStartY = y;
  const colX = [leftX, 400, 800];
  const headers = ['Earnings', 'Value'];
  headers.forEach((h, i) =>
    page.drawText(h, { x: colX[i], y, font: boldFont, size: 12 }),
  );
  y -= 20;
  page.drawText('Basic Salary', { x: colX[0], y, size: 10, font: boldFont });
  page.drawText(employee.salary.toFixed(2), { x: colX[1], y, size: 10, font });

  earnings.forEach((item) => {
    y -= lineHeight;
    page.drawText(item.label, { x: colX[0], y, size: 9, font });
    page.drawText(item.amount.toFixed(2), { x: colX[1], y, size: 10, font });
  });
  y -= 25;
  page.drawText('PAYE Salary', { x: colX[0], y, size: 10, font: boldFont });
  page.drawText(gross.toFixed(2), { x: colX[1], y, size: 10, font });

  y -= lineHeight;
  page.drawText('Gross Salary', { x: colX[0], y, size: 10, font: boldFont });
  page.drawText(gross.toFixed(2), { x: colX[1], y, size: 10, font });

  // Deductions Table
  y -= 40;
  page.drawText('Deductions', { x: colX[0], y, font: boldFont, size: 13 });
  deductions.forEach((item) => {
    y -= lineHeight;
    page.drawText(item.label, { x: colX[0], y, size: 9, font });
    page.drawText(item.amount.toFixed(2), { x: colX[1], y, size: 10, font });
  });
  y -= 20;
  page.drawText('Paye Tax', { x: colX[0], y, size: 9, font: boldFont });
  page.drawText(paye.toFixed(2), { x: colX[1], y, size: 10, font });

  y -= 15;
  page.drawText('Total Deductions', {
    x: colX[0],
    y,
    size: 9,
    font: boldFont,
  });
  page.drawText((deductAmount + paye).toFixed(2), {
    x: colX[1],
    y,
    size: 10,
    font,
  });

  y -= lineHeight;
  page.drawLine({
    start: { x: leftX, y },
    end: { x: 470, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  y -= 25;
  page.drawText('Net Salary', { x: colX[0], y, size: 12, font: boldFont });
  page.drawText(net.toFixed(2), { x: colX[1], y, size: 12, font: boldFont });

  //Company Contributions
  y -= 40;
  page.drawText('Company Contributions:', {
    x: leftX,
    y,
    size: 12,
    font: boldFont,
  });
  y -= 20;
  page.drawText(`EPF ${employerFundRate}%  -`, {
    x: leftX,
    y,
    size: 9,
    font: font,
  });
  page.drawText(((gross * employerFundRate) / 100).toFixed(2), {
    x: leftX + 48,
    y,
    size: 9,
    font: font,
  });

  page.drawText(`ETF ${ETF}% -`, { x: leftX + 200, y, size: 9, font: font });
  page.drawText(((gross * ETF) / 100).toFixed(2), {
    x: leftX + 240,
    y,
    size: 9,
    font: font,
  });

  //PDF Saving
  const pdfBytes = await pdfDoc.save();

  // Upload to Firebase Storage
  const filename = `${employee.id}-${month}.pdf`;
  await firebaseService.uploadFile(employee.id, filename, pdfBytes);

  // Optionally return the file path or URL
  return `payrolls/${employee.id}/${filename}`;
}
