'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  Package, 
  RefreshCw 
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/formatters';
import { DashboardSummary } from '@/types';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DashboardSummary>('/dashboard/summary');
      if (res.data) {
        setSummary(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat ringkasan dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-28 bg-slate-200 rounded-xl" />
          <div className="h-28 bg-slate-200 rounded-xl" />
          <div className="h-28 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-800">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="font-semibold">{error || 'Gagal memuat ringkasan dashboard'}</p>
        <button
          onClick={fetchSummary}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Coba Lagi
        </button>
      </div>
    );
  }

  const maxRevenue = Math.max(...summary.daily_sales.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Penjualan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ringkasan performa toko, inventori, dan transaksi penjualan
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSummary}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition"
            title="Muat ulang data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Transaksi Baru</span>
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Banner if any products have stock < 5 */}
      {summary.low_stock_products.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Peringatan: {summary.low_stock_products.length} Produk dengan Stok Menipis (&lt; 5 Unit)
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                {summary.low_stock_products.map((p) => `${p.product_name} (${p.stock} sisa)`).slice(0, 3).join(', ')}
                {summary.low_stock_products.length > 3 ? ' dan produk lainnya.' : '.'}
              </p>
            </div>
          </div>
          <Link
            href="/products?sort=stock_asc"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 rounded-lg transition self-start sm:self-auto"
          >
            <span>Kelola Inventori</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Penjualan
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatRupiah(summary.total_sales)}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Omzet keseluruhan toko
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Transaksi
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {summary.total_transactions} <span className="text-sm font-normal text-slate-500">pesanan</span>
            </div>
            <span className="text-[11px] text-sky-600 font-medium mt-1 inline-flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              Transaksi terverifikasi
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Low Stock Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Stok Kritis (&lt; 5)
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {summary.low_stock_products.length} <span className="text-sm font-normal text-slate-500">item</span>
            </div>
            <span className={`text-[11px] font-medium mt-1 inline-flex items-center gap-1 ${
              summary.low_stock_products.length > 0 ? 'text-amber-600' : 'text-slate-500'
            }`}>
              <AlertTriangle className="w-3 h-3" />
              Perlu segera restok
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Bonus: Daily Sales Chart Section */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Grafik Penjualan Harian (14 Hari Terakhir)</h2>
            <p className="text-xs text-slate-500">Perkembangan total omzet penjualan per hari</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            Bonus Fitur
          </span>
        </div>

        {summary.daily_sales.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Belum ada data penjualan pada rentang waktu ini.
          </div>
        ) : (
          <div className="pt-4">
            <div className="h-48 flex items-end gap-2 sm:gap-4 border-b border-slate-200 pb-2">
              {summary.daily_sales.map((item, idx) => {
                const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 4);
                const shortDate = item.date.slice(8, 10) + '/' + item.date.slice(5, 7);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded shadow-lg pointer-events-none whitespace-nowrap">
                      <span>{item.date}</span>
                      <span className="font-bold text-sky-300">{formatRupiah(item.revenue)} ({item.total_orders} order)</span>
                    </div>

                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-sky-500 hover:bg-sky-600 rounded-t transition-all duration-300 group-hover:brightness-110"
                    />
                    <span className="text-[10px] text-slate-500 mt-2 rotate-0 truncate">
                      {shortDate}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
              <span>Tanggal Pembelian</span>
              <span>Skala Otomatis (Maks: {formatRupiah(maxRevenue)})</span>
            </div>
          </div>
        )}
      </div>

      {/* Top 5 Best Selling Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">5 Produk Terlaris</h2>
            <p className="text-xs text-slate-500">Peringkat produk berdasarkan total kuantitas penjualan</p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            <span>Lihat Semua Produk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Peringkat</th>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4 text-center">Total Terjual</th>
                <th className="py-3 px-4 text-right">Total Pendapatan</th>
                <th className="py-3 px-4 text-center">Sisa Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {summary.top_selling_products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada riwayat produk terjual.
                  </td>
                </tr>
              ) : (
                summary.top_selling_products.map((item, index) => (
                  <tr key={item.product_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-600">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                        index === 0 ? 'bg-amber-100 text-amber-800' :
                        index === 1 ? 'bg-slate-200 text-slate-700' :
                        index === 2 ? 'bg-amber-50 text-amber-700' : 'text-slate-500'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-medium text-slate-600">
                      {item.product_code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.product_name}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900">
                      {item.total_quantity_sold} unit
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-700">
                      {formatRupiah(item.total_revenue)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.current_stock < 5 ? 'bg-red-50 text-red-700 font-bold' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.current_stock}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
