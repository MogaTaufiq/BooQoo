'use client';

// ============================================
// Stock In (Restock) Page
// ============================================

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Alert } from '@/components/ui';

interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  variants?: Array<{ id: string; name: string }>;
}

function StockInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams?.get('productId');

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [productId, setProductId] = useState(preselectedProductId || '');
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [costPrice, setCostPrice] = useState('');

  const selectedProduct = products.find((p) => p.id === productId);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=1000');
      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data: any = {
        productId,
        quantity: parseInt(quantity),
      };

      if (variantId) data.variantId = variantId;
      if (batchCode) data.batchCode = batchCode;
      if (expiryDate) data.expiryDate = new Date(expiryDate).toISOString();
      if (costPrice) data.costPrice = parseFloat(costPrice);

      const response = await fetch('/api/inventory/in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Gagal menambah stok');
      }

      setSuccess(true);

      // Reset form or redirect
      setTimeout(() => {
        router.push('/inventory');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tambah Stok</h2>
        <p className="text-gray-600 mt-1">
          Masukkan informasi stok yang akan ditambahkan
        </p>
      </div>

      {success && (
        <Alert
          type="success"
          message="Stok berhasil ditambahkan! Mengalihkan..."
        />
      )}

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pilih Produk
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produk <span className="text-red-500">*</span>
              </label>
              <select
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setVariantId(''); // Reset variant when product changes
                }}
                required
                className="block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih produk...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku}) - {product.unit}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Varian
                </label>
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  className="block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tanpa varian</option>
                  {selectedProduct.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Input
              label="Jumlah"
              type="number"
              placeholder="100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              helperText={selectedProduct ? `Dalam ${selectedProduct.unit}` : ''}
              required
              min="1"
            />
          </div>
        </div>

        {/* Optional Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detail Tambahan (Opsional)
          </h3>

          <div className="space-y-4">
            <Input
              label="Kode Batch"
              placeholder="BATCH-2023-001"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              helperText="Untuk tracking batch produksi"
            />

            <Input
              label="Tanggal Kedaluwarsa"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              helperText="Untuk produk yang memiliki masa kedaluwarsa"
            />

            <Input
              label="Harga Modal"
              type="number"
              placeholder="15000"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              helperText="Harga beli per unit untuk hitung profit"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading || !productId}>
            Tambah Stok
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function StockInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StockInForm />
    </Suspense>
  );
}
