import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dtos/cretae-user.dto";


@Controller('user')
export class UserController{
    constructor(private readonly userService:UserService){}

    @Post()
    create(@Body() dto:CreateUserDto){
        return this.userService.create(dto);
    }

    @Get()
    findMany(){
        return this.userService.findMany();

    }

    @Put(':id')
    update(@Param('id') id:number,@Body() dto:CreateUserDto){
        return this.userService.update(id,dto);

    }

    @Delete(':id')
    delete(@Param('id') id:number){
        return this.userService.delete(id);

    }

    
}