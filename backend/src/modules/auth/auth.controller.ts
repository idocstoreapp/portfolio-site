import { Controller, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('verify')
  async verify(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return { success: false, message: 'No token provided' };
    }

    try {
      const user = await this.authService.verifyToken(token);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}


