import { Module } from "@nestjs/common";
import { PayeTaxController } from "./paye-tax.controller";
import { PayeTaxService } from "./paye-tax.service";

@Module({
    controllers:[PayeTaxController],
    providers:[PayeTaxService],
})
export class PayeTaxModule{
    
}