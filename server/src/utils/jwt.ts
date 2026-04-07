import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config';

interface AccessTokenPayload {
  id: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  id: string;
}

export function generateAccessToken(user: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: 900 }; // 15 minutes
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    options,
  );
}

export function generateRefreshToken(user: RefreshTokenPayload): string {
  const options: SignOptions = { expiresIn: 2592000 }; // 30 days
  return jwt.sign(
    { id: user.id },
    config.jwtRefreshSecret,
    options,
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwtSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;
}
