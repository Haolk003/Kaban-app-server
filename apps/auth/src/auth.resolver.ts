import { Resolver, Query, Args, Context, Mutation } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';

import { Request, Response } from 'express';

import { User } from './entities/user.entity';

import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  LoginDto,
  RegisterDto,
  ActivateUserDto,
  forgotPasswordDto,
  resetPasswordDto,
} from './dto/user.dto';

import { LoginResponse, RegisterResponse } from './types/user.type';
import { AuthGuard } from './guards/auth.guard';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => String)
  getGoogleAuthUrl() {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=email profile`;
  }

  @Mutation(() => LoginResponse)
  @UseGuards(LocalAuthGuard)
  login(
    @Args('loginInput') loginDto: LoginDto,
    @Context() ctx: { req: Request; res: Response },
  ) {
    return this.authService.loginUser(loginDto.email, ctx.res);
  }

  @Mutation(() => RegisterResponse)
  async registerUser(@Args('registerDto') registerDto: RegisterDto) {
    const token = await this.authService.registerUser(registerDto);
    return { token };
  }

  @Mutation(() => User)
  async activateUser(
    @Args('activateUserInput') activationUserDto: ActivateUserDto,
  ) {
    const { activationCode, token } = activationUserDto;
    const response = this.authService.activateUser(token, activationCode);
    return response;
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@Context() ctx: { req: Request }) {
    return ctx.req.me;
  }

  @Mutation(() => User)
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordDto: forgotPasswordDto,
  ) {
    const response = await this.authService.forgotPassword(
      forgotPasswordDto.email,
    );
    return response;
  }

  @Mutation(() => String)
  async resetPassword(
    @Args('resetPasswordInput') resetPasswordInput: resetPasswordDto,
  ) {
    const { email, newPassword, token } = resetPasswordInput;
    const response = await this.authService.resetPassword(
      email,
      token,
      newPassword,
    );
    return response;
  }
}
