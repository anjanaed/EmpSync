import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
    async loginWithAuth0(email: string, password: string) {
        try {
          const response = await axios.post('https://dev-ew20puedqaszptqy.us.auth0.com/oauth/token', {
            grant_type: 'password',
            username: email,
            password: password,
            audience: 'https://dev-ew20puedqaszptqy.us.auth0.com/api/v2/',
            client_id: 'Do05XqmmkqHcQKLvOTYtTKQjsaLsf8zd',
            client_secret: '4Nf4ixAr_-Lz1twZHEbPExydGCR1uwWiDuuvVQeQyVgX1ADzA2oHXI9LvhA44TE1',
            scope: 'openid profile email',
            connection: 'Username-Password-Authentication',
          }, {
            headers: { 'Content-Type': 'application/json' },
          });

          console.log(response.data)
      
          return response.data;
        } catch (error) {
          console.error('Error during Auth0 login:', error.response?.data || error.message);
          throw new Error('Failed to authenticate with Auth0');
        }
      }}