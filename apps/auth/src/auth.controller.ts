import {
  Controller,
  Get,
  Req,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
  Body,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { CloudinaryService } from 'y/cloudinary';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly storageService: CloudinaryService,
  ) {}

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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }), // 10MB
          new FileTypeValidator({
            fileType:
              /^(image\/(jpeg|png|gif|jpg)|application\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document))$/,
          }),
        ],
      }),
    )
    file: any,
    @Body('folder') folder: string = 'default',
  ) {
    console.log(file);
    const response = await this.storageService.uploadAvatar(file, folder);
    return response;
  }
}
