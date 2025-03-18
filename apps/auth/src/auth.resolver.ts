import { Resolver, Query, Args, Context, Mutation } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';

import { Request, Response } from 'express';

import { LocalAuthGuard } from './guards/local-auth.guard';
import {} from 'graphql';
import {
  LoginDto,
  RegisterDto,
  ActivateUserDto,
  forgotPasswordDto,
  resetPasswordDto,
  UpdateProfileDto,
} from './dto/user.dto';

import { LoginResponse, RegisterResponse } from './types/user.type';
import { AuthGuard } from 'y/common/guards/auth.guard';
import { User } from 'y/common/entities/user.entity';
import { Throttle } from '@nestjs/throttler';

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

  @Throttle({ default: { limit: 5, ttl: 100 } })
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

  @Mutation(() => String)
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

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  logoutUser(@Context() ctx: { res: Response }) {
    ctx.res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 15 * 60 * 1000, // 15 phút
      domain: 'localhost',
    });

    ctx.res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 15 * 60 * 1000, // 15 phút
      domain: 'localhost',
    });
    return 'Loggout successfully';
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async updateProfile(
    @Context() ctx: { req: Request },
    @Args('updateProfileDto') updateProfileDto: UpdateProfileDto,
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };
    const response = await this.authService.updateProfile(
      userId,
      updateProfileDto,
    );
    return response;
  }

  // @Mutation(()=>String)
  // async uploadFile(@Args({name:'file',type:()=>GraphQl}))
}
