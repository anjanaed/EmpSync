import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly auth0Domain = 'https://dev-ew20puedqaszptqy.us.auth0.com';
  private readonly managementApiToken = 'https://dev-ew20puedqaszptqy.us.auth0.com/api/v2/'; // Replace My Auth0 Management API token

  async loginWithAuth0(email: string, password: string) {
    try {
      const response = await axios.post(`${this.auth0Domain}/oauth/token`, {
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

      return response.data;
    } catch (error) {
      console.error('Error during Auth0 login:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Auth0');
    }
  }

  async getEmailFromEmployeeID(employeeID: string): Promise<string> {
    try {
      const response = await axios.get(`${this.auth0Domain}/api/v2/users`, {
        headers: {
          Authorization: `Bearer ${this.managementApiToken}`,
        },
        params: {
          q: `user_metadata.employeeID:"${employeeID}"`,
          search_engine: 'v3',
        },
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0].email;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error resolving email from employeeID:', error.response?.data || error.message);
      throw new Error('Failed to resolve email');
    }
  }
}