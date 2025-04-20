import { Body, Controller, Delete, Get, Param, Post, Put,HttpException,HttpStatus, Query } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IndiAdjustmentService } from "./inAdjustment.service";

@Controller('indiadjustment')
export class IndiAdjustmentController{
    constructor(private readonly IndiAdjustmentService:IndiAdjustmentService){}

    @Post()
    create(@Body() dto:Prisma.IndividualSalaryAdjustmentsCreateInput ){
        return this.IndiAdjustmentService.create(dto);
    }

    @Get()
    findAll(@Query('search')search?:string){
        return this.IndiAdjustmentService.findAll(search);
    }

      @Get(':id')
      async findOne(@Param('id') id: number) {  
        try {
          const adjust = await this.IndiAdjustmentService.findOne(id);
          if (!adjust) {
            throw new HttpException('Adjustment not found', HttpStatus.NOT_FOUND);
          }
          return adjust;
        } catch (error) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Not Found',
              message: error.message,
            },
            HttpStatus.BAD_REQUEST
          );
        }
      }

    @Put(':id')
    update(@Param('id') id:number, @Body() dto:Prisma.IndividualSalaryAdjustmentsUpdateInput){
        return this.IndiAdjustmentService.update(id,dto);
    }

    @Delete(':id')
    remove(@Param('id') id:string){
        return this.IndiAdjustmentService.remove(id);
    }
}