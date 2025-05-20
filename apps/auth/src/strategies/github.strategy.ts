import { Strategy } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import axios from 'axios';
import { VerifiedCallback } from 'passport-jwt';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: 'http://localhost:4001/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      username: string;
      displayName: string;
      emails: [{ value: string }];
      photos: [{ value: string }];
    },
    done: VerifiedCallback,
  ): Promise<any> {
    interface Email {
      email: string;
      primary: boolean;
      verified: boolean;
    }

    const emailsResponse = await axios.get<Email[]>(
      'https://api.github.com/user/emails',
      {
        headers: { Authorization: `token ${accessToken}` },
      },
    );

    const primaryEmail = emailsResponse.data.find(
      (email: Email) => email.primary && email.verified,
    )?.email;

    if (!primaryEmail) {
      throw new Error('No primary email found');
    }
    const user = {
      id: profile.id,
      name: profile.displayName,
      picture: profile.photos[0].value,
      email: primaryEmail,
    };

    done(null, user);
  }
}
