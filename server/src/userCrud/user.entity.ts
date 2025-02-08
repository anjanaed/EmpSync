import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity({name:"User"})
export class User{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    title:string;
}
