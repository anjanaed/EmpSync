import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Request,
  Post,
  Put,
  UseGuards,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { Multer } from 'multer';
import { PayrollService } from './payroll.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../core/authentication/roles.guard';
import { Roles } from '../../core/authentication/roles.decorator';
import { FirebaseService } from './firebase.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post('calculate-all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async generatePayrollsForAll(
    @Body() dto: Prisma.PayrollCreateInput,
    @Query('orgId') orgId: string,
    @Res() res: Response,
  ) {
    try {
      await this.payrollService.generatePayrollsForAll(dto,orgId);
      res.status(200).json({ message: 'Payrolls Generated' });
    } catch (err) {
      res.status(500).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error generating payrolls',
        message: err.message,
      });
    }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async findAll(@Query('search') search?: string,@Query('orgId') orgId?: string) {
    try {
      return await this.payrollService.findAll(search, orgId);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch payrolls',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //For User Portal - Get user's own payroll records
  @Get('user/my-payrolls')
  @UseGuards(AuthGuard('jwt'))
  async getUserPayrolls(@Request() req) {
    try {
      let empId = req.user.employeeId;
      if (empId) {
        empId = empId.toUpperCase();
      }

      const payrolls = await this.payrollService.findUserPayrolls(empId);
      return payrolls;
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch user payrolls',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':empId/:month')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async findOne(@Param('empId') empId: string, @Param('month') month: string) {
    try {
      const payroll = await this.payrollService.findOne(empId, month);
      if (!payroll) {
        throw new HttpException('Payroll not found', HttpStatus.NOT_FOUND);
      }
      return payroll;
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Failed to fetch payroll',
          message: err.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async update(
    @Param('id') id: number,
    @Body() dto: Prisma.PayrollUpdateInput,
  ) {
    try {
      return await this.payrollService.update(id, dto);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to update payroll',
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async remove(@Param('id') id: number) {
    try {
      return await this.payrollService.remove(id);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to delete payroll',
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

@Delete('delete-by-month/:month')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('HR_ADMIN','KITCHEN_ADMIN')
async deletePayrollsByMonth(
  @Param('month') month: string,
  @Query('orgId') orgId: string // <-- add this
) {
  try {
    return await this.payrollService.deleteByMonth(month, orgId); // <-- pass orgId
  } catch (err) {
    throw new HttpException(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Failed to delete payrolls by month',
        message: err.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

  @Post('upload-pdf/:employeeId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPayrollPdf(
    @Param('employeeId') employeeId: string,
    @UploadedFile() file: Multer.File,
  ) {
    try {
      const filePath = await this.firebaseService.uploadFile(
        employeeId,
        file.originalname,
        file.buffer,
      );
      return { filePath };
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to upload file',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //For User Portal Usage
  @Get('geturl/by-month/:month')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getSignedUrlFromToken(@Request() req, @Param('month') month: string) {
    let empId = req.user.employeeId;
    if (empId) {
      empId = empId.toUpperCase();
    }

    try {
      const url = await this.firebaseService.getSignedUrlFromParams(
        empId,
        month,
      );
      return { url };
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to get signed URL',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //For User Portal Usage - Download
  @Get('geturl/download/by-month/:month')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getDownloadUrlFromToken(@Request() req, @Param('month') month: string) {
    let empId = req.user.employeeId;
    if (empId) {
      empId = empId.toUpperCase();
    }

    try {
      const url = await this.firebaseService.getSignedUrlFromParamsDownload(
        empId,
        month,
      );
      return { url };
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to get download URL',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //For User Portal Usage - Stream Download (CORS-friendly)
  @Get('download/stream/by-month/:month')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async streamDownloadPayroll(@Request() req, @Param('month') month: string, @Res() res: Response) {
    let empId = req.user.employeeId;
    if (empId) {
      empId = empId.toUpperCase();
    }

    try {
      // Get the file buffer from Firebase
      const fileBuffer = await this.firebaseService.getFileBuffer(empId, month);
      
      // Set appropriate headers for PDF download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${empId}-${month}.pdf"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      // Stream the file
      res.send(fileBuffer);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to download payroll',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //For HR Portal Usage
  @Get('geturl/as-hr/:empid/:month/:mode')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async getSignedUrlForHR(
    @Param('empid') empId: string,
    @Param('month') month: string,
    @Param('mode') mode: string,
  ) {
    if (empId) {
      empId = empId.toUpperCase();
    }

    try {
      if (mode === 'D') {
        const url = await this.firebaseService.getSignedUrlFromParamsDownload(
          empId,
          month,
        );
        return { url };
      } else {
        const url = await this.firebaseService.getSignedUrlFromParams(
          empId,
          month,
        );
        return { url };
      }
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to get signed URL',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete-by-month/:empid/:month')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('HR_ADMIN','KITCHEN_ADMIN')
  async deletePayrollAndFileByMonth(
    @Param('empid') empId: string,
    @Param('month') month: string,
  ) {
    if (empId) {
      empId = empId.toUpperCase();
    }

    try {
      // Delete payroll record(s) from DB
      const dbResult = await this.payrollService.deleteByMonthAndEmp(empId, month);

      // Delete file from Firebase Storage
      const fbResult = await this.firebaseService.deleteFile(empId, month);

      return {
        dbResult,
        fbResult,
      };
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to delete payroll and/or file',
          message: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
