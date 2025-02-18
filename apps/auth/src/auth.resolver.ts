import { Resolver, Query, Args, Context, Mutation } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { User } from './entities/user.entity';

import { GqlAuthGuard } from './guards/authGuard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto, RegisterDto, ActivateUserDto } from './dto/user.dto';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async googleLogin(
    @Args('code') code: string,
    @Context() context: { req: Request; res: Response },
  ) {
    const req = context.req;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = req.user;
    return this.authService.validateGoogleUser(user);
  }

  @Mutation(() => User)
  async googleLoginCallback(
    @Context() context: { req: Request; res: Response },
  ) {
    const req = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = req.user;
    return this.authService.validateGoogleUser(user);
  }

  @Query(() => String)
  hello() {
    return 'hello';
  }

  @Mutation(() => String)
  getGoogleAuthUrl() {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=email profile`;
  }

  @Mutation(() => User)
  @UseGuards(LocalAuthGuard)
  login(@Args('input') _input: LoginDto, @Context() context: { req: Request }) {
    console.log(context.req.user);
    return context.req.user;
  }

  @Mutation(() => String)
  async registerUser(@Args('registerDto') registerDto: RegisterDto) {
    const token = await this.authService.registerUser(registerDto);
    return token;
  }

  @Mutation(() => User)
  async activateUser(
    @Args('activateUserInput') activationUserDto: ActivateUserDto,
  ) {
    const { activationCode, token } = activationUserDto;
    const response = this.authService.activateUser(token, activationCode);
    return response;
  }
}
