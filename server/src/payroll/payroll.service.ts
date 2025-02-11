import {Injectable } from '@nestjs/common'
import {Prisma} from '@prisma/client'
import { DatabaseService } from 'src/database/database.service'


@Injectable()
export class PayrollService{
    constructor(private readonly databaseService:DatabaseService){}


async create(dto: Prisma.PayrollCreateInput){
    return this.databaseService.payroll.create({data:dto})
}

async findAll(){
    return this.databaseService.payroll.findMany({})
}

async findOne(id:string, month:string){
    return this.databaseService.payroll.findUnique({
        where:{
            id,
            month,
        }
    })
}

async update(id:string, dto:Prisma.PayrollUpdateInput){
    return this.databaseService.payroll.update({
        where:{
            id,
        },
        data:dto,
    })
}

async remove(id:string){
    return this.databaseService.payroll.delete({
        where:{
            id,
        }
    })
}



}