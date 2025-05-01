import { Injectable,HttpException, HttpStatus  } from '@nestjs/common';
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
      throw new HttpException(
        error.response?.data?.error_description || 'Failed to authenticate with Auth0',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );    }
  }

  async deleteAuth0UserByEmail(email:string) {
    try {
      const tokenRes = await axios.post(`https://dev-77pr5yqzs0m53x77.us.auth0.com/oauth/token`, {
        client_id: 'jPw9tY0jcdhSAhErMaqgdVGYQ6Srh3xs',
        client_secret: 'b-elWz_BWHoWAsNixkUhDfYghGJuy9tuE1gnE2MwSJfmn7fIPZqZIO7STDdRFrck',
        audience: `https://dev-77pr5yqzs0m53x77.us.auth0.com/api/v2/`,
        grant_type: "client_credentials",
      });
  
      const mgmtToken = tokenRes.data.access_token;
  
      const usersRes = await axios.get(
        `https://dev-77pr5yqzs0m53x77.us.auth0.com/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${mgmtToken}`,
          },
        }
      );
  
      const user = usersRes.data[0];
      const userId = user.user_id;
  
      await axios.delete(
        `https://dev-77pr5yqzs0m53x77.us.auth0.com/api/v2/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${mgmtToken}`,
          },
        }
      );
  
    } catch (error) {
      console.error("Error deleting user from Auth0:", error.response?.data || error.message);
    }
  }
}
