import { Body, Controller, Delete, Get, Param, Post, Put,HttpException,HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PayeTaxService } from "./PayeTax.service";

@Controller('paye')
export class PayeTaxController{
    constructor(private readonly payeTaxService:PayeTaxService){}

    @Post()
    create(@Body() dto:Prisma.PayeTaxSlabCreateInput ){
        return this.payeTaxService.create(dto);
    }

    @Get()
    findAll(){
        return this.payeTaxService.findAll();
    }

      @Get(':id')
      async findOne(@Param('id') id: number) {  
        try {
          const tax = await this.payeTaxService.findOne(id);
          if (!tax) {
            throw new HttpException('Tax record not found', HttpStatus.NOT_FOUND);
          }
          return tax;
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

    @Put()
    update(@Body() dto:Prisma.PayeTaxSlabCreateManyInput[]){
        return this.payeTaxService.update(dto);
    }

    @Delete(':id')
    remove(@Param('id') id:string){
        return this.payeTaxService.remove(id);
    }
}