import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import {Repository} from "typeorm";
import { CreateUserDto } from "./dtos/cretae-user.dto";

@Injectable()
export class UserService{
    constructor(@InjectRepository(User) private readonly userRepository:Repository<User>){}


    async create(dto:CreateUserDto){
        const user=this.userRepository.create(dto);
        return await this.userRepository.save(user);
    }

    findMany(){
        return this.userRepository.find()
    }

    async update(id:number,dto:CreateUserDto){
        const user=await this.userRepository.findOne({where:{id}});
        Object.assign(user,dto);
        return await this.userRepository.save(user);
    }

    async delete(id:number){
        const user= await this.userRepository.findOne({where:{id}});
        return await this.userRepository.remove(user);


    }

}