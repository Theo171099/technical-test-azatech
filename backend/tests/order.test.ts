import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import { generateAccessToken } from '../src/utils/jwt';

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    customer: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('Order Feature & Integration Tests', () => {
  const validToken = generateAccessToken({
    id: 'd3b07384-d113-4e89-8d19-91bb7d727409',
    email: 'admin@azatech.id',
    name: 'Admin AZA',
  });

  const dummyCustomerId = '9d2f6c1e-3245-48b2-b4ea-123456789abc';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST 1: Akses tanpa token
  it('1. Akses tanpa token: harus menolak pembuatan order dengan HTTP 401', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer_id: dummyCustomerId,
        items: [{ product_id: 1, quantity: 2 }],
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('token autentikasi tidak disertakan');
  });

  // TEST 2: Validasi input gagal
  it('2. Validasi input gagal: harus mengembalikan 422 jika format input tidak sesuai', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        customer_id: 'bukan-uuid',
        items: [], // kosong
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toHaveProperty('customer_id');
    expect(res.body.errors).toHaveProperty('items');
  });

  // TEST 3: Stok tidak cukup
  it('3. Stok tidak cukup: harus mengembalikan 422 dengan format error spesifik dan membatalkan order', async () => {
    vi.mocked(prisma.customer.findFirst).mockResolvedValue({
      id: dummyCustomerId,
      customer_name: 'Budi Santoso',
      deleted_at: null,
    } as any);

    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: BigInt(1),
        product_code: 'P0001',
        product_name: 'Hydrococo 150ml',
        stock: 3, // Tersisa 3
        price: 12000 as any,
        deleted_at: null,
      } as any,
    ]);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        customer_id: dummyCustomerId,
        items: [
          { product_id: 1, quantity: 5 }, // Meminta 5
        ],
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Stok tidak mencukupi');
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors['items.0.quantity']).toBeDefined();
    expect(res.body.errors['items.0.quantity'][0]).toContain('tersisa 3, diminta 5');
    // Verifikasi bahwa update stok TIDAK pernah dipanggil
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  // TEST 4: Buat order sukses
  it('4. Buat order sukses: harus menghitung total di server, membuat order atomik, dan mengurangi stok (201)', async () => {
    vi.mocked(prisma.customer.findFirst).mockResolvedValue({
      id: dummyCustomerId,
      customer_name: 'Budi Santoso',
      deleted_at: null,
    } as any);

    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: BigInt(1),
        product_code: 'P0001',
        product_name: 'Hydrococo 150ml',
        stock: 10,
        price: 12000 as any,
        deleted_at: null,
      } as any,
      {
        id: BigInt(2),
        product_code: 'P0002',
        product_name: 'Indomie Goreng',
        stock: 50,
        price: 3500 as any,
        deleted_at: null,
      } as any,
    ]);

    vi.mocked(prisma.order.count).mockResolvedValue(5);

    const mockCreatedOrder = {
      id: BigInt(101),
      order_number: 'INV-20261028-0006',
      customer_id: dummyCustomerId,
      created_by: 'd3b07384-d113-4e89-8d19-91bb7d727409',
      order_date: new Date(),
      total_amount: 31000 as any, // (12000 * 2) + (3500 * 2) = 24000 + 7000 = 31000
      order_items: [
        {
          id: BigInt(1),
          product_id: BigInt(1),
          quantity: 2,
          unit_price: 12000 as any,
          subtotal: 24000 as any,
        },
        {
          id: BigInt(2),
          product_id: BigInt(2),
          quantity: 2,
          unit_price: 3500 as any,
          subtotal: 7000 as any,
        },
      ],
      customer: { id: dummyCustomerId, customer_name: 'Budi Santoso' },
    };

    vi.mocked(prisma.order.create).mockResolvedValue(mockCreatedOrder as any);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        customer_id: dummyCustomerId,
        items: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 2 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order_number).toMatch(/^INV-\d{8}-\d{4}$/);
    expect(res.body.data.total_amount).toBe(31000);

    // Verifikasi bahwa decrement stok dipanggil untuk setiap produk dalam order
    expect(prisma.product.update).toHaveBeenCalledTimes(2);
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: BigInt(1) },
        data: { stock: { decrement: 2 } },
      })
    );
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: BigInt(2) },
        data: { stock: { decrement: 2 } },
      })
    );
  });

  // TEST 5: Get List Riwayat Order
  it('5. Riwayat Order: harus mengembalikan list pesanan dengan filter dan pagination (200)', async () => {
    vi.mocked(prisma.order.count).mockResolvedValue(1);
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      {
        id: BigInt(1),
        order_number: 'INV-20261028-0001',
        customer_id: dummyCustomerId,
        created_by: 'd3b07384-d113-4e89-8d19-91bb7d727409',
        order_date: new Date(),
        total_amount: 50000 as any,
        customer: { id: dummyCustomerId, customer_name: 'Budi Santoso', phone: '081234567890' },
        creator: { id: 'd3b07384', name: 'Admin AZA', email: 'admin@azatech.id' },
        _count: { order_items: 2 },
      } as any,
    ]);

    const res = await request(app)
      .get('/api/orders?page=1&per_page=10&from=2026-10-01&to=2026-10-28')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });
});
