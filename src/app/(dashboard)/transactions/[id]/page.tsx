'use client';

// ============================================
// Transaction Detail / Receipt Page
// ============================================

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, Alert } from '@/components/ui';

interface TransactionDetail {
  id: string;
  transactionDate: string;
  totalAmount: number;
  paymentMethod: string;
  amountReceived?: number;
  changeAmount?: number;
  customerName?: string;
  notes?: string;
  createdByUser: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    productName: string;
    variantName?: string;
    quantity: number;
    priceUnit: number;
    subtotal: number;
    product: {
      name: string;
      sku: string;
      unit: string;
    };
    variant?: {
      name: string;
    };
  }>;
  details: Array<{
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
    product: {
      name: string;
      sku: string;
      unit: string;
    };
    variant?: {
      name: string;
    };
  }>;
  user: {
    name: string;
    email: string;
  };
}

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.id as string;

  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  const fetchTransaction = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}`);
      const result = await response.json();

      if (result.success) {
        setTransaction(result.data);
      } else {
        setError(result.error?.message || 'Gagal mengambil detail transaksi');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const paymentMethodLabel: any = {
    CASH: 'Tunai',
    TRANSFER: 'Transfer Bank',
    E_WALLET: 'E-Wallet / QRIS',
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Memuat detail transaksi...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div>
        <Alert type="error" message={error || 'Transaksi tidak ditemukan'} />
        <Button onClick={() => router.push('/transactions')} className="mt-4">
          Kembali ke Riwayat
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-gray-900">Detail Transaksi</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/transactions')}>
            Kembali
          </Button>
          <Button onClick={handlePrint}>Cetak Struk</Button>
        </div>
      </div>

      {/* Success Alert */}
      <Alert
        type="success"
        message="✅ Transaksi berhasil! Struk telah tersimpan."
        className="print:hidden"
      />

      {/* Receipt */}
      <Card className="max-w-2xl mx-auto p-8 print:shadow-none print:border-none">
        {/* Header */}
        <div className="text-center mb-6 pb-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">STRUK PEMBELIAN</h1>
          <p className="text-sm text-gray-600">BooQoo POS</p>
          <p className="text-xs text-gray-500 mt-2">
            ID: {transaction.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Transaction Info */}
        <div className="mb-6 pb-6 border-b space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tanggal:</span>
            <span className="font-medium">
              {new Date(transaction.transactionDate).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Kasir:</span>
            <span className="font-medium">{transaction.createdByUser.name}</span>
          </div>
          {transaction.customerName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{transaction.customerName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Metode Pembayaran:</span>
            <span className="font-medium">{paymentMethodLabel[transaction.paymentMethod]}</span>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="font-semibold text-gray-900 mb-4">Detail Pembelian</h3>
          <div className="space-y-3">
            {transaction.items.map((detail, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {detail.product.name}
                    {detail.variant && ` - ${detail.variant.name}`}
                  </p>
                  <p className="text-xs text-gray-500">SKU: {detail.product.sku}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {detail.quantity} {detail.product.unit} × Rp{' '}
                    {Number(detail.priceUnit).toLocaleString('id-ID')}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  Rp {Number(detail.subtotal).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between text-lg">
            <span className="font-medium text-gray-700">Subtotal:</span>
            <span className="font-semibold">
              Rp {Number(transaction.totalAmount).toLocaleString('id-ID')}
            </span>
          </div>

          {transaction.amountReceived && (
            <div className="flex justify-between text-lg">
              <span className="font-medium text-gray-700">Dibayar:</span>
              <span className="font-semibold">
                Rp {Number(transaction.amountReceived).toLocaleString('id-ID')}
              </span>
            </div>
          )}

          {transaction.changeAmount && Number(transaction.changeAmount) > 0 && (
            <div className="flex justify-between text-lg">
              <span className="font-medium text-gray-700">Kembalian:</span>
              <span className="font-semibold text-green-600">
                Rp {Number(transaction.changeAmount).toLocaleString('id-ID')}
              </span>
            </div>
          )}

          <div className="pt-4 border-t-2 border-dashed">
            <div className="flex justify-between text-2xl font-bold">
              <span>TOTAL:</span>
              <span className="text-blue-600">
                Rp {Number(transaction.totalAmount).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {transaction.notes && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Catatan:</span> {transaction.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-600 mb-1">Terima kasih atas pembelian Anda!</p>
          <p className="text-xs text-gray-500">
            Barang yang sudah dibeli tidak dapat ditukar/dikembalikan
          </p>
        </div>
      </Card>

      {/* Actions (Print Hidden) */}
      <div className="max-w-2xl mx-auto mt-6 flex gap-3 print:hidden">
        <Button
          variant="outline"
          onClick={() => router.push('/checkout')}
          className="flex-1"
        >
          Transaksi Baru
        </Button>
        <Button
          onClick={() => router.push('/transactions')}
          className="flex-1"
        >
          Lihat Riwayat
        </Button>
      </div>
    </div>
  );
}
