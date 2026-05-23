'use client';

// ============================================
// Edit Product Page
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm';
import { Alert } from '@/components/ui';
import type { UpdateProductInput } from '@/types';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Gagal mengambil data produk');
      }

      setProduct(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (data: UpdateProductInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Gagal memperbarui produk');
      }

      setSuccess(true);

      // Redirect to products list after short delay
      setTimeout(() => {
        router.push('/products');
      }, 1500);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Memuat data produk...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <Alert type="error" message={error} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-12">
        <Alert type="error" message="Produk tidak ditemukan" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Produk</h2>
        <p className="text-gray-600 mt-1">
          Perbarui informasi produk {product.name}
        </p>
      </div>

      {success && (
        <Alert
          type="success"
          message="Produk berhasil diperbarui! Mengalihkan..."
        />
      )}

      <ProductForm
        mode="edit"
        initialData={{
          name: product.name,
          sku: product.sku,
          description: product.description || undefined,
          category: product.category || undefined,
          unit: product.unit,
          priceSell: Number(product.priceSell),
          priceCost: product.priceCost ? Number(product.priceCost) : undefined,
          imageUrl: product.imageUrl || undefined,
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
