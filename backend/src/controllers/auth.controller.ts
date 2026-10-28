import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/api-response';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      successResponse(res, 200, 'Login berhasil', result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    successResponse(res, 200, 'Logout berhasil');
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }
      const user = await AuthService.getProfile(req.user.id);
      successResponse(res, 200, 'Profil pengguna berhasil diambil', user);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.refresh(req.body.refresh_token);
      successResponse(res, 200, 'Token berhasil diperbarui', result);
    } catch (error) {
      next(error);
    }
  }
}
