import { Module } from "@nestjs/common";
import { AdjustmentController } from "./adjustment.controller";
import { AdjustmentService } from "./adjustment.service";

@Module({
    controllers:[AdjustmentController],
    providers:[AdjustmentService],
})
export class AdjustmentModule{
    
}