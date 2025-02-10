import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import {Prisma} from '@prisma/client'


@Controller('user')
export class UserController{
    constructor(private readonly userService:UserService){}

    @Post()
    create(@Body() dto:Prisma.UserCreateInput){
        return this.userService.create(dto);
    }

    @Get()
    findAll(){
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id:string){
        return this.userService.findOne(id);
    }


    @Put(':id')
    update(@Param('id') id:string,@Body() dto:Prisma.UserUpdateInput){
        return this.userService.update(id,dto);

    }

    @Delete(':id')
    delete(@Param('id') id:string){
        return this.userService.delete(id);

    }

    
}