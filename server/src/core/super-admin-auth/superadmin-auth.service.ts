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
  audience = process.env.SUPERADMIN_AUTH0_AUDIENCE;



  async superAdminLoginWithAuth0(email: string, password: string) {
    try {
      const response = await axios.post(
        `https://${this.url}/oauth/token`,
        {
          grant_type: "http://auth0.com/oauth/grant-type/password-realm",
          username: email,
          password: password,
          audience: `https://${this.audience}`,
          client_id: this.clientId, 
          client_secret: this.clientSecret, 
          realm: "SuperAdmin",
        },
      );
      console.log('Auth0 login response:', response.data);
      return response.data; 
    } catch (error) {
      console.log(error)
      throw new HttpException(
        error.response?.data?.error_description || 
          'Failed to authenticate with Auth0',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
    async superAdminDeleteAuth0UserByEmail(email: string) {
    try {
      // Step 1: Obtain a management API token
      const tokenRes = await axios.post(
        `https://${this.url}/oauth/token`, 
        {
          client_id: this.clientId, 
          client_secret: this.clientSecret, 
          audience: `https://${this.audience}`, 
          grant_type: 'client_credentials',
        },
      );

      const mgmtToken = tokenRes.data.access_token;

      // Step 2: Retrieve the user by email
      const usersRes = await axios.get(
        `https://${this.url}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${mgmtToken}`,
          },
        },
      );

      const user = usersRes.data[0];
      const userId = user.user_id;

      // Step 3: Delete the user by their ID
      await axios.delete(
        `https://${this.url}/api/v2/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${mgmtToken}`,
          },
        },
      );
      console.log(`User ${userId} deleted`) 
    } catch (error) {
      console.error(
        'Error deleting user from Auth0:',
        error.response?.data || error.message,
      );
    }
  }
}
