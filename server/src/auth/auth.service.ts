import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
  async loginWithAuth0(username: string, password: string) {
    try {
      const response = await axios.post(
        'https://dev-77pr5yqzs0m53x77.us.auth0.com/oauth/token',
        {
          grant_type: 'password',
          username: username,
          password: password,
          audience: 'https://dev-77pr5yqzs0m53x77.us.auth0.com/api/v2/',
          client_id: 'jPw9tY0jcdhSAhErMaqgdVGYQ6Srh3xs',
          client_secret:
            'b-elWz_BWHoWAsNixkUhDfYghGJuy9tuE1gnE2MwSJfmn7fIPZqZIO7STDdRFrck',
          scope: 'openid profile email',
          connection: 'Username-Password-Authentication',
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error during Auth0 login:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to authenticate with Auth0');
    }
  }
}
