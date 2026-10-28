/**
 * Formats a numeric value into standard Indonesian Rupiah format.
 * Example: 12000 -> "Rp 12.000"
 */
export function formatRupiah(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace(/\s/g, ' ');
}

/**
 * Formats an ISO date string into Indonesian readable format.
 * Example: "2026-10-28T07:44:00.000Z" -> "28 Oktober 2026, 14:44 WIB"
 */
export function formatDateTimeIndo(dateStr: string | Date): string {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date) + ' WIB';
}

/**
 * Formats an ISO date string into date-only Indonesian format.
 * Example: "1995-02-10" -> "10 Februari 1995"
 */
export function formatDateOnly(dateStr: string | Date): string {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
