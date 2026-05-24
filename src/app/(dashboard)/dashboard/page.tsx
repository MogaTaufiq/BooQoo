'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Card } from '@/components/ui';

export default function DashboardPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<any[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [todayTransactions, setTodayTransactions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [inventoryRes, transactionsRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch(`/api/transactions?startDate=${today.toISOString()}`),
      ]);

      const inventoryResult = await inventoryRes.json();
      const transactionsResult = await transactionsRes.json();

      if (inventoryResult.success) {
        setInventory(inventoryResult.data);
      }

      if (transactionsResult.success) {
        const transactions = transactionsResult.data;
        setTodayTransactions(transactions.length);
        setTodaySales(
          transactions.reduce((sum: number, t: any) => sum + Number(t.totalAmount), 0)
        );
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const lowStockCount = inventory.filter((item) => item.isLowStock).length;
  const expiringCount = inventory.filter((item) => item.hasExpiringSoon).length;
  const lowStockItems = inventory.filter((item) => item.isLowStock).slice(0, 5);
  const expiringItems = inventory.filter((item) => item.hasExpiringSoon).slice(0, 5);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/transactions')}>
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Penjualan Hari Ini
          </h3>
          <p className="text-3xl font-bold text-green-600">
            Rp {todaySales.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-blue-600 mt-1">Klik untuk lihat detail →</p>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/transactions')}>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Jumlah Transaksi</h3>
          <p className="text-3xl font-bold text-gray-900">{todayTransactions}</p>
          <p className="text-xs text-blue-600 mt-1">Klik untuk lihat detail →</p>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/inventory?filter=lowStock')}>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Stok Menipis</h3>
          <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
          <p className="text-xs text-blue-600 mt-1">Klik untuk lihat detail →</p>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/inventory?filter=expiring')}>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Akan Kedaluwarsa</h3>
          <p className="text-3xl font-bold text-red-600">{expiringCount}</p>
          <p className="text-xs text-blue-600 mt-1">Klik untuk lihat detail →</p>
        </Card>
      </div>

      {/* Alerts */}
      {!isLoading && (
        <>
          {lowStockCount > 0 && (
            <div className="mb-6">
              <Alert
                type="warning"
                message={`⚠️ ${lowStockCount} produk memiliki stok menipis`}
              />
              <Card className="mt-3 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Produk dengan Stok Menipis
                </h3>
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center p-2 bg-yellow-50 rounded hover:bg-yellow-100 cursor-pointer"
                      onClick={() => router.push(`/inventory/stock-in?productId=${item.productId}`)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">
                          {item.totalStock} {item.unit}
                        </p>
                        <p className="text-xs text-gray-500">Klik untuk tambah stok</p>
                      </div>
                    </div>
                  ))}
                </div>
                {lowStockCount > 5 && (
                  <button
                    onClick={() => router.push('/inventory?filter=lowStock')}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Lihat semua ({lowStockCount}) →
                  </button>
                )}
              </Card>
            </div>
          )}

          {expiringCount > 0 && (
            <div className="mb-6">
              <Alert
                type="error"
                message={`🕒 ${expiringCount} produk akan segera kedaluwarsa`}
              />
              <Card className="mt-3 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Produk Akan Kedaluwarsa
                </h3>
                <div className="space-y-2">
                  {expiringItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center p-2 bg-red-50 rounded"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.batches[0]?.batchCode || 'Batch Default'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          {item.batches[0]?.daysUntilExpiry} hari lagi
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.totalStock} {item.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {expiringCount > 5 && (
                  <button
                    onClick={() => router.push('/inventory?filter=expiring')}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Lihat semua ({expiringCount}) →
                  </button>
                )}
              </Card>
            </div>
          )}

          {lowStockCount === 0 && expiringCount === 0 && !isLoading && (
            <Alert
              type="success"
              message="✅ Semua stok dalam kondisi baik. Tidak ada peringatan."
            />
          )}
        </>
      )}
    </div>
  );
}
