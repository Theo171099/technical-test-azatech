'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatRupiah, formatDateTimeIndo } from '@/lib/formatters';
import { Order } from '@/types';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get<Order>(`/orders/${id}`);
        if (res.data) {
          setOrder(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat detail transaksi order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Memuat rincian pesanan...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-800 space-y-3 max-w-lg mx-auto mt-10">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h2 className="text-base font-bold">Data Order Tidak Ditemukan</h2>
        <p className="text-xs text-red-600">{error || 'ID pesanan tidak valid atau sudah dihapus.'}</p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Riwayat</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Riwayat Order</span>
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Bukti Transaksi</span>
        </button>
      </div>

      {/* Invoice Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-8 print:shadow-none print:border-none">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Transaksi Berhasil</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono">
              {order.order_number}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatDateTimeIndo(order.order_date)}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-slate-400 block uppercase font-medium">Kasir / Pencatat:</span>
            <span className="text-sm font-semibold text-slate-800 block">
              {order.creator?.name || 'Admin AZA'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {order.creator?.email || 'admin@azatech.id'}
            </span>
          </div>
        </div>

        {/* Customer Information Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Data Pembeli
            </span>
            <div className="text-sm font-bold text-slate-900">
              {order.customer?.customer_name}
            </div>
            <div className="text-slate-600 font-mono mt-0.5">
              {order.customer?.phone || 'Tanpa No. HP'}
            </div>
          </div>
          <div>
            <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Alamat Pengiriman / Pembeli
            </span>
            <div className="text-slate-700 leading-relaxed">
              {order.customer?.customer_address || '-'}
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Rincian Produk yang Dibeli</span>
          </h2>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Kode & Nama Produk</th>
                  <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {order.order_items?.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-xs text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">
                        {item.product?.product_name || 'Produk'}
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        {item.product?.product_code || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-xs text-slate-600 font-mono">
                      {formatRupiah(item.unit_price)}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 text-sm">
                  <td colSpan={4} className="py-3.5 px-4 font-bold text-slate-700 text-right uppercase text-xs">
                    Total Pembayaran:
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-right text-base">
                    {formatRupiah(order.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-400 print:text-slate-500">
          <p>Terima kasih atas transaksi Anda di Azatech Online Shop.</p>
          <p className="text-[11px] mt-0.5">Dokumen ini merupakan bukti transaksi yang sah dan dicatat secara sistemik.</p>
        </div>
      </div>
    </div>
  );
}
