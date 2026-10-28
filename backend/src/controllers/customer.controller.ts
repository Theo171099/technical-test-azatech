import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { successResponse } from '../utils/api-response';

export class CustomerController {
  static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CustomerService.getCustomers(req.query as any);
      successResponse(res, 200, 'OK', result.items, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      successResponse(res, 200, 'OK', customer);
    } catch (error) {
      next(error);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      successResponse(res, 201, 'Pelanggan berhasil ditambahkan', customer);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body);
      successResponse(res, 200, 'Data pelanggan berhasil diperbarui', customer);
    } catch (error) {
      next(error);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CustomerService.deleteCustomer(req.params.id);
      successResponse(res, 200, 'Pelanggan berhasil dihapus (soft delete)');
    } catch (error) {
      next(error);
    }
  }
}
