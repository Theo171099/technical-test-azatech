import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import { generateAccessToken } from '../src/utils/jwt';

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Product Endpoints', () => {
  const validToken = generateAccessToken({
    id: 'd3b07384-d113-4e89-8d19-91bb7d727409',
    email: 'admin@azatech.id',
    name: 'Admin AZA',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('harus menolak request list produk jika tanpa token (401)', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('harus mengembalikan list produk dengan pagination jika terautentikasi (200)', async () => {
    vi.mocked(prisma.product.count).mockResolvedValue(1);
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: BigInt(1),
        product_code: 'P0001',
        product_name: 'Hydrococo 150ml',
        stock: 10,
        price: 12000 as any,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ]);

    const res = await request(app)
      .get('/api/products?page=1&per_page=10')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toEqual({
      page: 1,
      per_page: 10,
      total: 1,
      total_pages: 1,
    });
  });

  it('harus gagal membuat produk jika harga <= 0 atau kode kosong (Validasi Input Gagal - 422)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        product_code: '',
        product_name: 'Test Produk',
        stock: -5,
        price: 0,
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toHaveProperty('product_code');
    expect(res.body.errors).toHaveProperty('stock');
    expect(res.body.errors).toHaveProperty('price');
  });

  it('harus menolak jika kode produk sudah terdaftar (409 Conflict)', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({
      id: BigInt(1),
      product_code: 'P0001',
    } as any);

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        product_code: 'P0001',
        product_name: 'Hydrococo Baru',
        stock: 10,
        price: 15000,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Kode produk sudah terdaftar');
  });

  it('harus melakukan soft delete pada produk (200)', async () => {
    vi.mocked(prisma.product.findFirst).mockResolvedValue({
      id: BigInt(1),
      product_code: 'P0001',
      product_name: 'Hydrococo 150ml',
      stock: 10,
      deleted_at: null,
    } as any);

    vi.mocked(prisma.product.update).mockResolvedValue({
      id: BigInt(1),
      deleted_at: new Date(),
    } as any);

    const res = await request(app)
      .delete('/api/products/1')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('soft delete');
  });
});
