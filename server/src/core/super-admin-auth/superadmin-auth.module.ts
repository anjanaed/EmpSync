import { SuperAdminJwtStrategy } from './superadmin-jwt.strategy';
import { Module } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PassportModule } from '@nestjs/passport';
import { SuperAdminAuthController } from './superadmin-auth.controller';
import { SuperAdminAuthService } from './superadmin-auth.service';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
  ],
  controllers: [SuperAdminAuthController],
  providers: [SuperAdminAuthService, SuperAdminJwtStrategy,DatabaseService], 
  exports: [SuperAdminAuthService, SuperAdminJwtStrategy, PassportModule],
})
export class SuperAdminAuthModule {}