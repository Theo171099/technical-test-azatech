import { describe, it, expect } from 'vitest';
import { formatRupiah, formatDateOnly } from './formatters';

describe('Frontend Formatter Utilities', () => {
  it('harus memformat angka ke mata uang Rupiah standar (Rp 12.000)', () => {
    expect(formatRupiah(12000)).toMatch(/Rp\s?12\.000/);
    expect(formatRupiah(0)).toMatch(/Rp\s?0/);
    expect(formatRupiah('35000')).toMatch(/Rp\s?35\.000/);
  });

  it('harus memformat tanggal ke format Indonesia', () => {
    const formatted = formatDateOnly('1995-02-10');
    expect(formatted).toBe('10 Februari 1995');
  });

  it('harus mengembalikan tanda strip (-) jika tanggal null/kosong', () => {
    expect(formatDateOnly('')).toBe('-');
  });
});
