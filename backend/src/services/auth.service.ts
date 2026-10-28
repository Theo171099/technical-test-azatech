import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { LoginInput } from '../schemas/auth.schema';

export class AuthService {
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      const error: any = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      const error: any = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    return {
      user: payload,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }

  static async refresh(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        const error: any = new Error('User tidak ditemukan');
        error.statusCode = 401;
        throw error;
      }

      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const newAccessToken = generateAccessToken(payload);
      return { access_token: newAccessToken };
    } catch {
      const error: any = new Error('Refresh token tidak valid atau sudah kedaluwarsa');
      error.statusCode = 401;
      throw error;
    }
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    if (!user) {
      const error: any = new Error('Pengguna tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}
