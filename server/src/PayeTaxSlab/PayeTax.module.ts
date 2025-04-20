import { Module } from "@nestjs/common";
import { PayeTaxController } from "./PayeTax.controller";
import { PayeTaxService } from "./PayeTax.service";

@Module({
    controllers:[PayeTaxController],
    providers:[PayeTaxService],
})
export class PayeTaxModule{
    
}