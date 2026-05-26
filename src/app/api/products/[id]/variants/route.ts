// ============================================
// Product Variants API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const variantSchema = z.object({
  name: z.string().min(2, 'Nama varian minimal 2 karakter'),
  skuSuffix: z.string().min(1, 'SKU suffix harus diisi'),
  priceModifier: z.number().optional().default(0),
});

// POST /api/products/[id]/variants - Add variant to product
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const validationResult = variantSchema.safeParse(body);
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

    // Check if product exists and belongs to user's store
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

    const data = validationResult.data;

    // Create variant
    const variant = await prisma.productVariant.create({
      data: {
        productId: params.id,
        name: data.name,
        skuSuffix: data.skuSuffix,
        priceModifier: data.priceModifier,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: variant,
        message: 'Varian berhasil ditambahkan',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create variant error:', error);
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

// GET /api/products/[id]/variants - Get all variants for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if product exists and belongs to user's store
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

    const variants = await prisma.productVariant.findMany({
      where: { productId: params.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: variants,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get variants error:', error);
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
