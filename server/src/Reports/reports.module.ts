import { Module } from "@nestjs/common";
import { ReportController } from "./reports.controller";
import { ReportService } from "./reports.service";

@Module({
    controllers:[ReportController],
    providers:[ReportService],
})
export class ReportModule{
    
}