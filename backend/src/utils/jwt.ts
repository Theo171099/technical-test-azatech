import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'azatech-medior-fullstack-secret-key-2026';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1d') as string;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'azatech-refresh-token-secret-key-2026';
const REFRESH_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as string;

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function generateRefreshToken(payload: { id: string; email: string }): string {
  const options: SignOptions = { expiresIn: REFRESH_EXPIRES_IN as any };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): { id: string; email: string } {
  return jwt.verify(token, REFRESH_SECRET) as { id: string; email: string };
}
