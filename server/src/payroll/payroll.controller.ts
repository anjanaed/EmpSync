import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PayrollService } from "./payroll.service";

@Controller('payroll')
export class PayrollController{
    constructor(private readonly payrollService:PayrollService){}

    @Post()
    create(@Body() dto:Prisma.PayrollCreateInput ){
        return this.payrollService.create(dto);
    }

    @Get()
    findAll(){
        return this.payrollService.findAll();
    }

    @Get(':id/:month')
    findOne(@Param('id') id:string, @Param('month') month:string){
        return this.payrollService.findOne(id,month);

    }

    @Put(':id')
    update(@Param('id') id:string, @Body() dto:Prisma.PayrollUpdateInput){
        return this.payrollService.update(id,dto);
    }

    @Delete(':id')
    remove(@Param('id') id:string){
        return this.payrollService.remove(id);
    }
}