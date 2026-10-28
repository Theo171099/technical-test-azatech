import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/api-response';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'Data';
    errorResponse(res, 409, `${target} sudah terdaftar dalam sistem`);
    return;
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    errorResponse(res, 404, 'Data yang diminta tidak ditemukan');
    return;
  }

  // Domain-specific business logic error with custom status
  if (err.statusCode) {
    errorResponse(res, err.statusCode, err.message, err.errors);
    return;
  }

  console.error('Unhandled internal error:', err);
  errorResponse(res, 500, 'Terjadi kesalahan internal pada server');
}
