import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UserService } from '../user/user.service'; 
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    const url = process.env.AUTH0_URL; 

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${url}/.well-known/jwks.json`,
      }),
      issuer: `https://${url}/`,
      audience: `https://${url}/api/v2/`,
      
    });
  }

  async validate(payload: any) {
    try {
      const employeeId = payload['https://empidReceiver.com'];

      if (!employeeId || typeof employeeId !== 'string') {
        throw new Error('Invalid or missing employeeId in JWT payload');
      }

      const currentUser = await this.userService.findOne(employeeId.toUpperCase());
      const userRole = currentUser.role;

      return {
        employeeId,
        role: userRole,
      };
    } catch (error) {
      console.error('JWT validation error:', error);
      // Return null to indicate failed validation without crashing the app
      return null;
    }
  }
}
