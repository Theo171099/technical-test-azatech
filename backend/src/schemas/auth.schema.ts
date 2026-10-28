import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email wajib diisi' }).email('Format email tidak valid'),
  password: z.string({ required_error: 'Password wajib diisi' }).min(1, 'Password tidak boleh kosong'),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string({ required_error: 'Refresh token wajib disertakan' }).min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
