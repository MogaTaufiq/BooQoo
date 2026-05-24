'use client';

// ============================================
// Transactions History Page
// ============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Alert } from '@/components/ui';

interface Transaction {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  amountPaid: number;
  changeAmount: number;
  customerName?: string;
  status: string;
  createdAt: Date;
  details: Array<{
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  user: {
    name: string;
  };
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'today'>('all');

  useEffect(() => {
    fetchTransactions();
  }, [page, filter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.append('startDate', today.toISOString());
      }

      const response = await fetch(`/api/transactions?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setTransactions(result.data);
        setTotalPages(result.pagination.totalPages);
      } else {
        setError(result.error?.message || 'Gagal mengambil data transaksi');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalSales = () => {
    return transactions.reduce((sum, t) => sum + Number(t.totalAmount), 0);
  };

  const paymentMethodLabel: any = {
    CASH: 'Tunai',
    TRANSFER: 'Transfer',
    E_WALLET: 'E-Wallet',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h2>
        <Button onClick={() => router.push('/checkout')}>+ Transaksi Baru</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Transaksi</h3>
          <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Penjualan</h3>
          <p className="text-3xl font-bold text-green-600">
            Rp {getTotalSales().toLocaleString('id-ID')}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Rata-rata</h3>
          <p className="text-3xl font-bold text-blue-600">
            Rp{' '}
            {transactions.length > 0
              ? Math.round(getTotalSales() / transactions.length).toLocaleString('id-ID')
              : 0}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => {
              setFilter('today');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Hari Ini
          </button>
        </div>
      </Card>

      {/* Transactions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat data transaksi...</p>
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : transactions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">Belum ada transaksi</p>
          <Button onClick={() => router.push('/checkout')}>Buat Transaksi Pertama</Button>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/transactions/${transaction.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.transactionDate).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Kasir: {transaction.createdByUser.name}
                    </p>
                    {transaction.customerName && (
                      <p className="text-xs text-gray-500">
                        Customer: {transaction.customerName}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      Rp {Number(transaction.totalAmount).toLocaleString('id-ID')}
                    </p>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                      {paymentMethodLabel[transaction.paymentMethod]}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-2">
                    {transaction.items.length} item
                  </p>
                  <div className="space-y-1">
                    {transaction.items.slice(0, 3).map((detail, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {detail.quantity}x {detail.productName}
                        </span>
                        <span className="text-gray-900 font-medium">
                          Rp {Number(detail.subtotal).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                    {transaction.items.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{transaction.items.length - 3} item lainnya
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
