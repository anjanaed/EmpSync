import { Body, Controller, Delete, Get, Param, Post, Put,HttpException,HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AdjustmentService } from "./adjustment.service";

@Controller('adjustment')
export class AdjustmentController{
    constructor(private readonly adjustmentService:AdjustmentService){}

    @Post()
    create(@Body() dto:Prisma.SalaryAdjustmentsCreateInput ){
        return this.adjustmentService.create(dto);
    }

    @Get()
    findAll(){
        return this.adjustmentService.findAll();
    }

      @Get(':id')
      async findOne(@Param('id') id: number) {  
        try {
          const meal = await this.adjustmentService.findOne(id);
          if (!meal) {
            throw new HttpException('Adjustment not found', HttpStatus.NOT_FOUND);
          }
          return meal;
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
    update(@Param('id') id:string, @Body() dto:Prisma.SalaryAdjustmentsUpdateInput){
        return this.adjustmentService.update(id,dto);
    }

    @Delete(':id')
    remove(@Param('id') id:string){
        return this.adjustmentService.remove(id);
    }
}