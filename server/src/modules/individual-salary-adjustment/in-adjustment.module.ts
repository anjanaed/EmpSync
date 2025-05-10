import { Module } from "@nestjs/common";
import { IndiAdjustmentController } from "./in-adjustment.controller";
import { IndiAdjustmentService } from "./in-adjustment.service";

@Module({
    controllers:[IndiAdjustmentController],
    providers:[IndiAdjustmentService],
})
export class IndiAdjustmentModule{
    
}