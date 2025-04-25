import { Body, Controller, Post } from '@nestjs/common';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  @Post('google/redirect')
  async googleAuthRedirect(@Body() body: { token: string }) {
    try {
      const { token } = body;

      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
      );

      const user = response.data;
      return {
        email: user.email,
        name: user.name,
        picture: user.picture,
      };
    } catch (error) {
      console.error(
        'Google auth error:',
        error.response?.data || error.message,
      );
      throw new Error('Google authentication failed');
    }
  }
}
