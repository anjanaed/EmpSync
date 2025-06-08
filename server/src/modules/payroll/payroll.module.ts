import { Module } from "@nestjs/common";
import { PayrollController } from "./payroll.controller";
import { PayrollService } from "./payroll.service";
import { FirebaseService } from "./firebase.service";


@Module({
    controllers:[PayrollController],
    providers:[PayrollService,FirebaseService],
})
export class PayrollModule{
    
}