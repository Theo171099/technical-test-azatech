import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { successResponse } from '../utils/api-response';

export class DashboardController {
  static async summary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await DashboardService.getSummary();
      successResponse(res, 200, 'Ringkasan dashboard berhasil dimuat', summary);
    } catch (error) {
      next(error);
    }
  }
}
