// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import axios from 'axios';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://dev-77pr5yqzs0m53x77.us.auth0.com/.well-known/jwks.json`,
      }),
      issuer: `https://dev-77pr5yqzs0m53x77.us.auth0.com/`,
      audience: 'https://dev-77pr5yqzs0m53x77.us.auth0.com/api/v2/',
    });
  }

  async validate(payload: any) {
    const employeeId = payload['https://empidReceiver.com'];
    const response = await axios.get(
      `http://localhost:3000/user/${employeeId.toUpperCase()}`,
    );
    const currentUser = response.data;
    const userRole = currentUser.role;

    return {
      employeeId,
      role: userRole,
    };
  }
}
