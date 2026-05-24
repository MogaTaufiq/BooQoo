'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Alert } from '@/components/ui';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const result = await response.json();

      if (result.success) {
        setProduct(result.data);
      } else {
        setError(result.error?.message || 'Produk tidak ditemukan');
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Terjadi kesalahan saat mengambil data produk');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Alert type="error" message={error || 'Produk tidak ditemukan'} />
        <Button onClick={() => router.push('/products')} className="mt-4">
          Kembali ke Daftar Produk
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <div className="space-x-2">
          <Button onClick={() => router.push(`/products/${product.id}/edit`)}>
            Edit
          </Button>
          <Button variant="outline" onClick={() => router.push('/products')}>
            Kembali
          </Button>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">SKU</label>
              <p className="text-gray-900 mt-1">{product.sku}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Kategori</label>
              <p className="text-gray-900 mt-1">{product.category || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Unit</label>
              <p className="text-gray-900 mt-1">{product.unit}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <p className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    product.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Harga Jual</label>
              <p className="text-2xl font-bold text-green-600 mt-1">
                Rp {Number(product.priceSell).toLocaleString('id-ID')}
              </p>
            </div>

            {product.priceCost && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Harga Modal</label>
                <p className="text-lg font-semibold text-gray-700 mt-1">
                  Rp {Number(product.priceCost).toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Margin:{' '}
                  {(
                    ((Number(product.priceSell) - Number(product.priceCost)) /
                      Number(product.priceCost)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-gray-600">Dibuat</label>
              <p className="text-gray-900 mt-1">
                {new Date(product.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Terakhir Diupdate
              </label>
              <p className="text-gray-900 mt-1">
                {new Date(product.updatedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-6 pt-6 border-t">
            <label className="text-sm font-semibold text-gray-600">Deskripsi</label>
            <p className="text-gray-700 mt-2">{product.description}</p>
          </div>
        )}
      </Card>

      {/* Variants Card */}
      {product.variants && product.variants.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Varian Produk ({product.variants.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.variants.map((variant: any) => (
              <Card key={variant.id} className="p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{variant.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      SKU: {product.sku}-{variant.skuSuffix}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {Number(variant.priceModifier) >= 0 ? '+' : ''}
                      Rp {Number(variant.priceModifier).toLocaleString('id-ID')}
                    </p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      Rp{' '}
                      {(
                        Number(product.priceSell) + Number(variant.priceModifier)
                      ).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Image Card */}
      {product.imageUrl && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gambar Produk</h3>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-w-md rounded-lg shadow-md"
          />
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push(`/inventory/stock-in?productId=${product.id}`)}>
            Tambah Stok
          </Button>
          <Button onClick={() => router.push('/inventory')}>Lihat Stok</Button>
          <Button onClick={() => router.push(`/products/${product.id}/edit`)}>
            Edit Produk
          </Button>
        </div>
      </Card>
    </div>
  );
}
