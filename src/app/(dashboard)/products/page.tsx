'use client';

// ============================================
// Product List Page
// ============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductStore } from '@/store/productStore';
import { Button, Input, Card, Badge, EmptyState, SkeletonCard } from '@/components/ui';

export default function ProductsPage() {
  const router = useRouter();
  const {
    products,
    filters,
    isLoading,
    setProducts,
    setFilters,
    setLoading,
    setError,
  } = useProductStore();

  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));

      const response = await fetch(`/api/products?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.error?.message || 'Gagal mengambil data produk');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ search });
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilters({});
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Produk</h2>
        <Button onClick={() => router.push('/products/new')}>
          + Tambah Produk
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari produk atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch}>Cari</Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ isActive: undefined })}
            className={`px-3 py-1 rounded-full text-sm ${
              filters.isActive === undefined
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilters({ isActive: true })}
            className={`px-3 py-1 rounded-full text-sm ${
              filters.isActive === true
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setFilters({ isActive: false })}
            className={`px-3 py-1 rounded-full text-sm ${
              filters.isActive === false
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tidak Aktif
          </button>
        </div>
      </Card>

      {/* Product List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada produk"
            description="Tambahkan produk pertama Anda untuk mulai berjualan"
            actionLabel="Tambah Produk Pertama"
            onAction={() => router.push('/products/new')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">{product.sku}</p>
                </div>
                <Badge variant={product.isActive ? 'success' : 'default'}>
                  {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-xs text-gray-500">Harga Jual</p>
                  <p className="text-lg font-bold text-primary">
                    Rp {product.priceSell.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Stok</p>
                  <p
                    className={`text-lg font-bold ${
                      product.lowStock ? 'text-yellow-600' : 'text-gray-900'
                    }`}
                  >
                    {product.currentStock} {product.unit}
                  </p>
                </div>
              </div>

              {product.category && (
                <p className="text-xs text-gray-500 mb-3">
                  Kategori: {product.category}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  Detail
                </Button>
                <Button
                  size="sm"
                  fullWidth
                  onClick={() => router.push(`/products/${product.id}/edit`)}
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
