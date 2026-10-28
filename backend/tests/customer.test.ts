import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import { generateAccessToken } from '../src/utils/jwt';

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    customer: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Customer Endpoints', () => {
  const validToken = generateAccessToken({
    id: 'd3b07384-d113-4e89-8d19-91bb7d727409',
    email: 'admin@azatech.id',
    name: 'Admin AZA',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('harus menolak request tanpa token autentikasi (401)', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(401);
  });

  it('harus mengembalikan list customer dengan pagination (200)', async () => {
    vi.mocked(prisma.customer.count).mockResolvedValue(1);
    vi.mocked(prisma.customer.findMany).mockResolvedValue([
      {
        id: '9d2f6c1e-3245-48b2-b4ea-123456789abc',
        customer_name: 'Budi Santoso',
        customer_address: 'Jakarta',
        gender: 'Pria' as any,
        birth_date: new Date('1990-01-01'),
        phone: '081234567890',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ]);

    const res = await request(app)
      .get('/api/customers?page=1&per_page=10')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('harus gagal membuat customer jika gender bukan Pria/Wanita atau birth_date salah (Validasi Gagal - 422)', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        customer_name: 'Test Customer',
        customer_address: 'Jakarta',
        gender: 'Unknown',
        birth_date: 'invalid-date',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toHaveProperty('gender');
    expect(res.body.errors).toHaveProperty('birth_date');
  });

  it('harus berhasil membuat customer baru (201)', async () => {
    vi.mocked(prisma.customer.create).mockResolvedValue({
      id: '9d2f6c1e-3245-48b2-b4ea-123456789abc',
      customer_name: 'Budi Santoso',
      customer_address: 'Jakarta Pusat',
      gender: 'Pria' as any,
      birth_date: new Date('1990-01-01'),
      phone: '081234567890',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });

    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        customer_name: 'Budi Santoso',
        customer_address: 'Jakarta Pusat',
        gender: 'Pria',
        birth_date: '1990-01-01',
        phone: '081234567890',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.customer_name).toBe('Budi Santoso');
  });
});
