import { vi } from 'vitest';

if (!('toJSON' in BigInt.prototype)) {
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}

process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.JWT_EXPIRES_IN = '1d';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-12345';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';

// Silence console logs during tests unless DEBUG=true
if (!process.env.DEBUG) {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
}
