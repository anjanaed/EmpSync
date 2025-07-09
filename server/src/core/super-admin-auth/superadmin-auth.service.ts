import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class SuperAdminAuthService {
  url = process.env.AUTH0_URL;
  clientId = process.env.SUPERADMIN_AUTH0_CLIENT_ID;
  clientSecret = process.env.SUPERADMIN_AUTH0_SECRET;

  async superAdminLoginWithAuth0(username: string, password: string) {
    try {
      const response = await axios.post(
        `https://${this.url}/oauth/token`,
        {
          grant_type: 'password',
          username: username,
          password: password,
          audience: `https://${this.url}/api/v2/`, // Use the env variable for audience
          client_id: this.clientId, // Use the env variable for client_id
          client_secret: this.clientSecret, // Use the env variable for client_secret
          scope: 'openid profile email',
          connection: 'SuperAdmin',
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      console.log('Auth0 login response:', response.data); // Log the response
      return response.data; // Return the response data on success
    } catch (error) {
      console.error(
        'Error during Auth0 login:', // Log the error
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.response?.data?.error_description || // Use error description if available
          'Failed to authenticate with Auth0',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
