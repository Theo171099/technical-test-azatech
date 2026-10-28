import { z } from 'zod';

export const orderItemInputSchema = z.object({
  product_id: z.coerce.number().int().positive('ID produk tidak valid'),
  quantity: z.number({ required_error: 'Jumlah item wajib diisi' }).int().positive('Jumlah item harus lebih dari 0'),
});

export const createOrderSchema = z.object({
  customer_id: z.string({ required_error: 'ID pelanggan wajib diisi' }).uuid('ID pelanggan harus berupa format UUID yang valid'),
  items: z
    .array(orderItemInputSchema, { required_error: 'Daftar item pesanan wajib diisi' })
    .min(1, 'Pesanan harus memiliki minimal 1 item produk'),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(10),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal from harus YYYY-MM-DD').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal to harus YYYY-MM-DD').optional(),
  customer_id: z.string().uuid('ID pelanggan tidak valid').optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
