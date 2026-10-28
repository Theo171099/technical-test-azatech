'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  User,
  PackageCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/formatters';
import { Customer, Product } from '@/types';

interface OrderItemRow {
  product_id: number;
  quantity: number;
}

export default function CreateOrderPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [customerId, setCustomerId] = useState<string>('');
  const [items, setItems] = useState<OrderItemRow[]>([
    { product_id: 0, quantity: 1 },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get<Customer[]>('/customers', { per_page: 100 }),
          api.get<Product[]>('/products', { per_page: 100 }),
        ]);

        if (custRes.data && custRes.data.length > 0) {
          setCustomers(custRes.data);
          setCustomerId(custRes.data[0].id);
        }

        if (prodRes.data && prodRes.data.length > 0) {
          setProducts(prodRes.data);
          // Preselect first product for row 0
          setItems([{ product_id: prodRes.data[0].id, quantity: 1 }]);
        }
      } catch (err: any) {
        setGeneralError(err.message || 'Gagal memuat data pelanggan dan produk');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const addRow = () => {
    const defaultProdId = products.length > 0 ? products[0].id : 0;
    setItems([...items, { product_id: defaultProdId, quantity: 1 }]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, idx) => idx !== index);
    setItems(newItems);

    // Clear any server errors for this index
    const newErrors = { ...serverErrors };
    delete newErrors[`items.${index}.quantity`];
    delete newErrors[`items.${index}.product_id`];
    setServerErrors(newErrors);
  };

  const updateRowProduct = (index: number, productId: number) => {
    const newItems = [...items];
    newItems[index].product_id = productId;
    setItems(newItems);

    // Clear server error on this row when changed
    if (serverErrors[`items.${index}.quantity`]) {
      const newErrors = { ...serverErrors };
      delete newErrors[`items.${index}.quantity`];
      setServerErrors(newErrors);
    }
  };

  const updateRowQuantity = (index: number, quantity: number) => {
    const q = Math.max(1, quantity);
    const newItems = [...items];
    newItems[index].quantity = q;
    setItems(newItems);

    if (serverErrors[`items.${index}.quantity`]) {
      const newErrors = { ...serverErrors };
      delete newErrors[`items.${index}.quantity`];
      setServerErrors(newErrors);
    }
  };

  // Calculate live preview total
  const estimatedTotal = items.reduce((acc, row) => {
    const prod = products.find((p) => p.id === row.product_id);
    if (!prod) return acc;
    return acc + Number(prod.price) * row.quantity;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setServerErrors({});
    setSubmitting(true);

    try {
      const payload = {
        customer_id: customerId,
        items: items.map((it) => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
        })),
      };

      const res = await api.post<any>('/orders', payload);

      if (res.data?.id) {
        router.push(`/orders/${res.data.id}`);
      } else {
        router.push('/orders');
      }
    } catch (err: any) {
      if (err.errors) {
        setServerErrors(err.errors);
      }
      setGeneralError(err.message || 'Gagal memproses transaksi pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Memuat katalog produk dan pelanggan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button and page title */}
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
          className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          title="Kembali ke Riwayat Order"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Buat Transaksi Penjualan Baru
          </h1>
          <p className="text-sm text-slate-500">
            Form kasir pencatatan order dengan validasi stok atomik di server
          </p>
        </div>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Terjadi Kendala Transaksi</h4>
            <p className="text-xs text-red-700 mt-0.5">{generalError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Selection */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-sky-600" />
            <span>1. Pilih Pelanggan</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Pelanggan Terdaftar <span className="text-red-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_name} ({c.phone || 'Tanpa No. HP'}) — {c.customer_address}
                </option>
              ))}
            </select>
            {serverErrors.customer_id && (
              <p className="text-xs text-red-600 mt-1">{serverErrors.customer_id[0]}</p>
            )}
          </div>
        </div>

        {/* Step 2: Dynamic Products List */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <ShoppingCart className="w-5 h-5 text-sky-600" />
              <span>2. Item Produk yang Dipesan</span>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((row, idx) => {
              const selectedProd = products.find((p) => p.id === row.product_id);
              const subtotalPreview = selectedProd ? Number(selectedProd.price) * row.quantity : 0;
              const hasError = !!serverErrors[`items.${idx}.quantity`] || !!serverErrors[`items.${idx}.product_id`];

              return (
                <div
                  key={idx}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-colors ${
                    hasError ? 'bg-red-50/50 border-red-300' : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    {/* Item Row Number */}
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>

                    {/* Product Selection */}
                    <div className="flex-1 w-full">
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                        Pilih Produk
                      </label>
                      <select
                        value={row.product_id}
                        onChange={(e) => updateRowProduct(idx, parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.product_code}] {p.product_name} — {formatRupiah(p.price)} (Stok: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="w-full sm:w-32">
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                        Jumlah
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={row.quantity}
                        onChange={(e) => updateRowQuantity(idx, parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-center font-semibold ${
                          hasError ? 'border-red-400 text-red-900' : 'border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Subtotal Preview */}
                    <div className="w-full sm:w-40 text-left sm:text-right">
                      <span className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                        Subtotal (Est.)
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {formatRupiah(subtotalPreview)}
                      </span>
                    </div>

                    {/* Delete Row Button */}
                    <div className="self-end md:self-center mt-2 md:mt-5">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        disabled={items.length <= 1}
                        title="Hapus baris ini"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Error Display Specifically for this Item Row */}
                  {serverErrors[`items.${idx}.quantity`] && (
                    <div className="mt-2.5 pt-2 border-t border-red-200/60 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{serverErrors[`items.${idx}.quantity`][0]}</span>
                    </div>
                  )}
                  {serverErrors[`items.${idx}.product_id`] && (
                    <div className="mt-2.5 pt-2 border-t border-red-200/60 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{serverErrors[`items.${idx}.product_id`][0]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Transaction Summary & Checkout */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Total Pembayaran ({items.length} Macam Produk)
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 mt-1">
              {formatRupiah(estimatedTotal)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              *Harga dan total dihitung serta dikunci oleh server secara atomik saat submit.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/orders"
              className="w-1/2 sm:w-auto text-center px-4 py-2.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-bold shadow transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-4 h-4" />
                  <span>Konfirmasi & Buat Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
