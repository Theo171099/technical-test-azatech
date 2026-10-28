import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { successResponse, errorResponse } from '../utils/api-response';

export class OrderController {
  static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OrderService.getOrders(req.query as any);
      successResponse(res, 200, 'OK', result.items, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const order = await OrderService.getOrderById(id);
      successResponse(res, 200, 'OK', order);
    } catch (error) {
      next(error);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        errorResponse(res, 401, 'Unauthorized');
        return;
      }
      const order = await OrderService.createOrder(req.user.id, req.body);
      successResponse(res, 201, 'Pesanan berhasil dibuat', order);
    } catch (error) {
      next(error);
    }
  }
}
