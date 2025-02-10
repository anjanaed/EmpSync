import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import {Prisma } from '@prisma/client';

@Injectable()
export class UserService{
    constructor(private readonly databaseService:DatabaseService){}


    async create(dto:Prisma.UserCreateInput){
        return this.databaseService.user.create({data:dto})
    }

    async findAll(){
        return this.databaseService.user.findMany();
    }

    async findOne(id:string){
        return this.databaseService.user.findUnique({
            where:{
                id,
            }
        })
    }

    async update(id:string,dto:Prisma.UserUpdateInput){
        return await this.databaseService.user.update({
            where:{
                id,
            },
            data:dto,
        })
    }

    async delete(id:string){
        return await this.databaseService.user.delete({
            where:{id}
        });
    }

}