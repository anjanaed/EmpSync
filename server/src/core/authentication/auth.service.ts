import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
  url = process.env.AUTH0_URL;
  clientId = process.env.AUTH0_CLIENT_ID;
  clientSecret = process.env.AUTH0_CLIENT_SECRET;

 // Method to log in a user with Auth0 using username and password
  async loginWithAuth0(username: string, password: string) {
    try {
      const response = await axios.post(
        `https://${this.url}/oauth/token`, 
        {
          grant_type: 'password',
          username: username,
          password: password,
          audience: `https://${this.url}/api/v2/`, 
          client_id: this.clientId, 
          client_secret: this.clientSecret, 
          scope: 'openid profile email',
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      console.log('Auth0 login successful:', response.data); 
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
  // Method to delete an Auth0 user by their email
  async deleteAuth0UserByEmail(email: string) {
    try {
      // Step 1: Obtain a management API token
      const tokenRes = await axios.post(
        `https://${this.url}/oauth/token`, 
        {
          client_id: this.clientId, 
          client_secret: this.clientSecret,
          audience: `https://${this.url}/api/v2/`,
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
