import { Module } from "@nestjs/common";
import { SuperAdminController } from "./super-admin.controller";
import { SuperAdminService } from './super-admin.service';
import { PassportModule } from '@nestjs/passport';
import { DatabaseService } from "src/database/database.service";
import { SuperAdminJwtStrategy } from "src/core/super-admin-auth/superadmin-jwt.strategy";

@Module({
      imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
  ],
    controllers:[SuperAdminController],
    providers: [SuperAdminService, SuperAdminJwtStrategy,DatabaseService],
    exports: [SuperAdminService, SuperAdminJwtStrategy, PassportModule],
})
export class SuperAdminModule{
    
}