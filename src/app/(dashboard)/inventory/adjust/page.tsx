'use client';

// ============================================
// Stock Adjustment Page
// ============================================

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Alert } from '@/components/ui';

interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  variants?: Array<{ id: string; name: string }>;
}

const adjustmentReasons = [
  { value: 'DAMAGED', label: 'Rusak/Cacat' },
  { value: 'EXPIRED', label: 'Kedaluwarsa' },
  { value: 'LOST', label: 'Hilang' },
  { value: 'FOUND', label: 'Ditemukan' },
  { value: 'CORRECTION', label: 'Koreksi' },
  { value: 'SAMPLE', label: 'Sampel' },
  { value: 'OTHER', label: 'Lainnya' },
];

export default function StockAdjustmentPage() {
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
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('subtract');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

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
      const quantityValue = parseInt(quantity);
      const adjustedQuantity = adjustmentType === 'subtract' ? -quantityValue : quantityValue;

      const data: any = {
        productId,
        quantity: adjustedQuantity,
        reason,
      };

      if (variantId) data.variantId = variantId;
      if (notes) data.notes = notes;

      const response = await fetch('/api/inventory/adjustment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Gagal menyesuaikan stok');
      }

      setSuccess(true);

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
        <h2 className="text-2xl font-bold text-gray-900">Penyesuaian Stok</h2>
        <p className="text-gray-600 mt-1">
          Tambah atau kurangi stok secara manual
        </p>
      </div>

      {success && (
        <Alert
          type="success"
          message="Stok berhasil disesuaikan! Mengalihkan..."
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
                  setVariantId('');
                }}
                required
                className="block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih produk...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
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
          </div>
        </div>

        {/* Adjustment Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detail Penyesuaian
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Penyesuaian <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="add"
                    checked={adjustmentType === 'add'}
                    onChange={() => setAdjustmentType('add')}
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">Tambah Stok (+)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="subtract"
                    checked={adjustmentType === 'subtract'}
                    onChange={() => setAdjustmentType('subtract')}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">Kurangi Stok (-)</span>
                </label>
              </div>
            </div>

            <Input
              label="Jumlah"
              type="number"
              placeholder="10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              helperText={selectedProduct ? `Dalam ${selectedProduct.unit}` : ''}
              required
              min="1"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alasan <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih alasan...</option>
                {adjustmentReasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tambahkan catatan detail (opsional)"
              />
            </div>
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
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !productId || !reason}
            variant={adjustmentType === 'subtract' ? 'danger' : 'primary'}
          >
            {adjustmentType === 'add' ? 'Tambah Stok' : 'Kurangi Stok'}
          </Button>
        </div>
      </form>
    </div>
  );
}
