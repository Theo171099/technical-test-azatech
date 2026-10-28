import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { successResponse } from '../utils/api-response';

export class ProductController {
  static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.getProducts(req.query as any);
      successResponse(res, 200, 'OK', result.items, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const product = await ProductService.getProductById(id);
      successResponse(res, 200, 'OK', product);
    } catch (error) {
      next(error);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.body);
      successResponse(res, 201, 'Produk berhasil ditambahkan', product);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const product = await ProductService.updateProduct(id, req.body);
      successResponse(res, 200, 'Produk berhasil diperbarui', product);
    } catch (error) {
      next(error);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await ProductService.deleteProduct(id);
      successResponse(res, 200, 'Produk berhasil dihapus (soft delete)');
    } catch (error) {
      next(error);
    }
  }
}
