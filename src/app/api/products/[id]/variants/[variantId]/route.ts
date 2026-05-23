// ============================================
// Product Variant API - Update & Delete
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';
import { z } from 'zod';

const updateVariantSchema = z.object({
  name: z.string().min(2).optional(),
  skuSuffix: z.string().min(1).optional(),
  priceModifier: z.number().optional(),
});

// PUT /api/products/[id]/variants/[variantId] - Update variant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tidak terautentikasi' },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateVariantSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data tidak valid',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if product and variant exist and belong to user's store
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId: token.storeId as string,
      },
    });

    if (!product) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Produk tidak ditemukan' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const variant = await prisma.productVariant.findFirst({
      where: {
        id: params.variantId,
        productId: params.id,
      },
    });

    if (!variant) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Varian tidak ditemukan' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const data = validationResult.data;

    // Update variant
    const updatedVariant = await prisma.productVariant.update({
      where: { id: params.variantId },
      data,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: updatedVariant,
        message: 'Varian berhasil diperbarui',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update variant error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan' },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]/variants/[variantId] - Delete variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Tidak terautentikasi' },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Check if product and variant exist and belong to user's store
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId: token.storeId as string,
      },
    });

    if (!product) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Produk tidak ditemukan' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const variant = await prisma.productVariant.findFirst({
      where: {
        id: params.variantId,
        productId: params.id,
      },
    });

    if (!variant) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Varian tidak ditemukan' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Delete variant
    await prisma.productVariant.delete({
      where: { id: params.variantId },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Varian berhasil dihapus',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete variant error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan' },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
