'use client';

// ============================================
// Create Product Page
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm';
import { Alert } from '@/components/ui';
import type { CreateProductInput } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: CreateProductInput) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Gagal membuat produk');
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tambah Produk Baru</h2>
        <p className="text-gray-600 mt-1">
          Isi informasi produk yang akan dijual
        </p>
      </div>

      {success && (
        <Alert
          type="success"
          message="Produk berhasil ditambahkan! Mengalihkan..."
        />
      )}

      <ProductForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
