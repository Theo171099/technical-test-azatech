import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import bcrypt from 'bcryptjs';
import { generateAccessToken } from '../src/utils/jwt';

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Auth Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('harus menolak login jika email tidak valid (Validasi Gagal - 422)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bukan-email', password: '123' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('harus menolak login dengan kredensial salah (401)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@azatech.id', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Email atau password salah');
  });

  it('harus berhasil login dengan kredensial yang valid (200)', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'd3b07384-d113-4e89-8d19-91bb7d727409',
      name: 'Admin AZA',
      email: 'admin@azatech.id',
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@azatech.id', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('tokens');
    expect(res.body.data.tokens).toHaveProperty('access_token');
    expect(res.body.data.user.email).toBe('admin@azatech.id');
  });

  it('harus menolak akses ke endpoint profil tanpa token (401 - Akses Tanpa Token)', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('token autentikasi tidak disertakan');
  });

  it('harus mengembalikan profil pengguna jika menyertakan token valid (200)', async () => {
    const token = generateAccessToken({
      id: 'd3b07384-d113-4e89-8d19-91bb7d727409',
      email: 'admin@azatech.id',
      name: 'Admin AZA',
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'd3b07384-d113-4e89-8d19-91bb7d727409',
      name: 'Admin AZA',
      email: 'admin@azatech.id',
      created_at: new Date(),
    } as any);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('admin@azatech.id');
  });
});
