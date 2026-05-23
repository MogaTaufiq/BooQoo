'use client';

// ============================================
// Inventory Overview Page
// ============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Alert } from '@/components/ui';

interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  category?: string;
  totalStock: number;
  isLowStock: boolean;
  hasExpiringSoon: boolean;
  batches: Array<{
    id: string;
    quantity: number;
    batchCode?: string;
    expiryDate?: Date;
    daysUntilExpiry?: number;
  }>;
}

export default function InventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'lowStock' | 'expiring'>('all');

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filter === 'lowStock') params.append('lowStock', 'true');
      if (filter === 'expiring') params.append('expiringSoon', 'true');

      const response = await fetch(`/api/inventory?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setInventory(result.data);
      } else {
        setError(result.error?.message || 'Gagal mengambil data stok');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchInventory();
  };

  const lowStockCount = inventory.filter((item) => item.isLowStock).length;
  const expiringCount = inventory.filter((item) => item.hasExpiringSoon).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Stok</h2>
        <Button onClick={() => router.push('/inventory/stock-in')}>
          + Tambah Stok
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Produk</h3>
          <p className="text-3xl font-bold text-gray-900">{inventory.length}</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Stok Menipis</h3>
          <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Hampir Kedaluwarsa</h3>
          <p className="text-3xl font-bold text-red-600">{expiringCount}</p>
        </Card>
      </div>

      {/* Alerts */}
      {lowStockCount > 0 && filter === 'all' && (
        <Alert
          type="warning"
          message={`${lowStockCount} produk memiliki stok menipis`}
        />
      )}

      {expiringCount > 0 && filter === 'all' && (
        <Alert
          type="error"
          message={`${expiringCount} produk akan segera kedaluwarsa`}
        />
      )}

      {/* Search & Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Cari</Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Semua Produk
          </button>
          <button
            onClick={() => setFilter('lowStock')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'lowStock'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Stok Menipis ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter('expiring')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'expiring'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Akan Kedaluwarsa ({expiringCount})
          </button>
        </div>
      </Card>

      {/* Inventory List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat data stok...</p>
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : inventory.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">
            {filter !== 'all' ? 'Tidak ada produk yang sesuai filter' : 'Belum ada stok'}
          </p>
          <Button onClick={() => router.push('/inventory/stock-in')}>
            Tambah Stok Pertama
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {inventory.map((item) => (
            <Card key={item.productId} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {item.productName}
                    </h3>
                    {item.isLowStock && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Stok Menipis
                      </span>
                    )}
                    {item.hasExpiringSoon && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Akan Kedaluwarsa
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-3">
                    SKU: {item.sku}
                    {item.category && ` • ${item.category}`}
                  </p>

                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Stok Total</p>
                      <p className={`text-2xl font-bold ${
                        item.isLowStock ? 'text-yellow-600' : 'text-gray-900'
                      }`}>
                        {item.totalStock} {item.unit}
                      </p>
                    </div>

                    {item.batches.length > 1 && (
                      <div>
                        <p className="text-sm text-gray-600">Jumlah Batch</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {item.batches.length}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Batch Details */}
                  {item.batches.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {item.batches.map((batch) => (
                        <div
                          key={batch.id}
                          className="text-sm bg-gray-50 p-2 rounded flex justify-between"
                        >
                          <span>
                            {batch.batchCode ? `Batch: ${batch.batchCode}` : 'Batch Default'}
                            {' • '}
                            {batch.quantity} {item.unit}
                          </span>
                          {batch.expiryDate && (
                            <span
                              className={`${
                                typeof batch.daysUntilExpiry === 'number' && batch.daysUntilExpiry <= 7
                                  ? 'text-red-600 font-semibold'
                                  : 'text-gray-600'
                              }`}
                            >
                              Exp: {new Date(batch.expiryDate).toLocaleDateString('id-ID')}
                              {typeof batch.daysUntilExpiry === 'number' &&
                                ` (${batch.daysUntilExpiry} hari lagi)`}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/inventory/stock-in?productId=${item.productId}`)}
                  >
                    + Stok
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/inventory/adjust?productId=${item.productId}`)}
                  >
                    Sesuaikan
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
