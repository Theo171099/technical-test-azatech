'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  Search, 
  Calendar, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Download, 
  Plus, 
  FilterX
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatRupiah, formatDateTimeIndo } from '@/lib/formatters';
import { Order, PaginationMeta, Customer } from '@/types';

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, per_page: 10, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    // Fetch customers list for filter dropdown
    api.get<Customer[]>('/customers', { per_page: 100 }).then((res) => {
      if (res.data) setCustomers(res.data);
    }).catch(() => {});
  }, []);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get<Order[]>('/orders', {
        page,
        per_page: 10,
        customer_id: selectedCustomer || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });

      if (res.data) {
        setOrders(res.data);
      }
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [selectedCustomer, fromDate, toDate]);

  const resetFilters = () => {
    setSelectedCustomer('');
    setFromDate('');
    setToDate('');
  };

  // Bonus Feature: Export Order History to CSV
  const exportToCSV = () => {
    if (orders.length === 0) return;

    const headers = ['No. Order', 'Tanggal Order', 'Nama Pelanggan', 'No. HP Pelanggan', 'Jumlah Macam Item', 'Total Pembayaran (Rp)'];
    const rows = orders.map((o) => [
      `"${o.order_number}"`,
      `"${o.order_date}"`,
      `"${o.customer?.customer_name || '-'}"`,
      `"${o.customer?.phone || '-'}"`,
      o._count?.order_items || (o.order_items ? o.order_items.length : 1),
      Number(o.total_amount),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat_order_azatech_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Riwayat Pesanan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Daftar seluruh transaksi order penjualan yang telah tercatat di sistem
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={exportToCSV}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-40"
            title="Export riwayat transaksi ke format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Order</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        {/* Customer Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
            Filter Pelanggan
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Semua Pelanggan</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customer_name}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Reset Filter Action */}
        <div>
          <button
            onClick={resetFilters}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">No. Order</th>
                <th className="py-3 px-4">Waktu Transaksi</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4 text-center">Banyak Item</th>
                <th className="py-3 px-4 text-right">Total Transaksi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat riwayat transaksi...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Belum ada order yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-sky-800">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {formatDateTimeIndo(order.order_date)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>{order.customer?.customer_name || 'Pelanggan Dihapus'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {order.customer?.phone || '-'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {order._count?.order_items || (order.order_items ? order.order_items.length : 1)} macam
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {formatRupiah(order.total_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan data <strong>{meta.total > 0 ? (meta.page - 1) * meta.per_page + 1 : 0}</strong> -{' '}
            <strong>{Math.min(meta.page * meta.per_page, meta.total)}</strong> dari total <strong>{meta.total}</strong> order
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(meta.page - 1)}
              disabled={meta.page <= 1 || loading}
              className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium px-2">
              Halaman {meta.page} dari {meta.total_pages}
            </span>
            <button
              onClick={() => fetchOrders(meta.page + 1)}
              disabled={meta.page >= meta.total_pages || loading}
              className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
