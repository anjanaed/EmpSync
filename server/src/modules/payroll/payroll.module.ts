import { Module } from "@nestjs/common";
import { PayrollController } from "./payroll.controller";
import { PayrollService } from "./payroll.service";
import { FirebaseService } from "./firebase.service";
import { OrdersModule } from "../order/order.module";


@Module({
    imports: [OrdersModule],
    controllers:[PayrollController],
    providers:[PayrollService,FirebaseService],
})
export class PayrollModule{
    
}