'use client';

// ============================================
// Product Form Component
// ============================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema } from '@/lib/validators/schemas';
import { Button, Input, Alert } from '@/components/ui';
import type { z } from 'zod';
import { useState } from 'react';

type ProductFormData = z.infer<typeof createProductSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  mode,
}) => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData || {
      unit: 'PCS',
    },
  });

  const handleFormSubmit = async (data: ProductFormData) => {
    setError(null);
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informasi Dasar
        </h3>

        <div className="space-y-4">
          <Input
            label="Nama Produk"
            placeholder="Contoh: Pempek Kapal Selam"
            error={errors.name?.message}
            {...register('name')}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SKU"
              placeholder="Opsional (otomatis jika kosong)"
              error={errors.sku?.message}
              helperText="Kode unik produk"
              {...register('sku')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Satuan <span className="text-red-500">*</span>
              </label>
              <select
                {...register('unit')}
                className="block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PCS">Pcs</option>
                <option value="KG">Kg</option>
                <option value="GRAM">Gram</option>
                <option value="LITER">Liter</option>
                <option value="ML">Ml</option>
                <option value="BOX">Box</option>
                <option value="PACK">Pack</option>
              </select>
              {errors.unit && (
                <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <Input
            label="Kategori"
            placeholder="Contoh: Frozen Food"
            error={errors.category?.message}
            helperText="Opsional"
            {...register('category')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Deskripsi produk (opsional)"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Harga</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Harga Jual"
            type="number"
            placeholder="50000"
            error={errors.priceSell?.message}
            helperText="Harga jual ke pelanggan"
            {...register('priceSell', { valueAsNumber: true })}
            required
          />

          <Input
            label="Harga Beli/Modal"
            type="number"
            placeholder="35000"
            error={errors.priceCost?.message}
            helperText="Opsional, untuk hitung profit"
            {...register('priceCost', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          {mode === 'create' ? 'Tambah Produk' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  );
};
