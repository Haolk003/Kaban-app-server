// constants.ts
export enum TokenType {
  ACCESS = 'accessToken',
  REFRESH = 'refreshToken',
}

export enum AuthError {
  LOGIN_REQUIRED = 'Authentication required',
  INVALID_TOKEN = 'Invalid credentials',
  ACCESS_TOKEN_EXPIRED = 'Session expired',
  REFRESH_TOKEN_EXPIRED = 'Please login again',
  ACCOUNT_INACTIVE = 'Account is inactive',
  ACCOUNT_NOT_FOUND = 'Invalid Credentials',
  INVALID_TOKEN_TYPE = 'Invalid token type',
}

export const CookieConfig = {
  ACCESS: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
    maxAge: 15 * 60 * 1000, // 15 phút
  },
  REFRESH: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  },
};
