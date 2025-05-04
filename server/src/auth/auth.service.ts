import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
  // Get values from the environment variables
  url = process.env.AUTH0_URL;
  clientId = process.env.AUTH0_CLIENT_ID;
  clientSecret = process.env.AUTH0_CLIENT_SECRET;

  async loginWithAuth0(username: string, password: string) {
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
      throw new HttpException(
        error.response?.data?.error_description ||
          'Failed to authenticate with Auth0',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAuth0UserByEmail(email: string) {
    try {
      const tokenRes = await axios.post(
        `https://${this.url}/oauth/token`, // Use the env variable for the URL
        {
          client_id: this.clientId, // Use the env variable for client_id
          client_secret: this.clientSecret, // Use the env variable for client_secret
          audience: `https://${this.url}/api/v2/`, // Use the env variable for audience
          grant_type: 'client_credentials',
        },
      );

      const mgmtToken = tokenRes.data.access_token;

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
