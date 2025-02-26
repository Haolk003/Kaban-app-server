import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

import { Request, Response } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @Get('auth/google')
  @UseGuards(AuthGuard('google'))
  google() {
    return 'login-google';
  }

  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      return 'No user from google';
    }
    const { id, email, firstName, lastName, picture } = req.user as {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      picture: string;
    };
    await this.authService.validateGoogleUser(
      {
        id,
        email,
        firstName,
        lastName,
        picture,
      },
      res,
    );

    return res.redirect('http://localhost:3000');
  }

  @Get('auth/github')
  @UseGuards(AuthGuard('github'))
  login() {
    return 'login-github';
  }

  @Get('auth/github/callback')
  @UseGuards(AuthGuard('github'))
  async callback(@Req() req: Request, @Res() res: Response) {
    const { id, name, email, picture } = req.user as {
      id: string;
      name: string;
      email: string;
      picture: string;
    };

    await this.authService.validateGithub({ email, id, name, picture }, res);

    return res.redirect('http://localhost:3000');
  }
}
