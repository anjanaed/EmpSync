import { Module } from "@nestjs/common";
import { IndiAdjustmentController } from "./inAdjustment.controller";
import { IndiAdjustmentService } from "./inAdjustment.service";

@Module({
    controllers:[IndiAdjustmentController],
    providers:[IndiAdjustmentService],
})
export class IndiAdjustmentModule{
    
}