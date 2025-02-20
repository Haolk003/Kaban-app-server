import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: Request) {
    const user = await this.authService.validateGoogleUser({ ...req.user });
    console.log(user);
    return 'hello';
  }
}
