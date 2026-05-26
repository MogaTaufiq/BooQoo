// ============================================
// Products API - Get, Update, Delete by ID
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { updateProductSchema } from '@/lib/validators/schemas';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

// GET /api/products/[id] - Get product by ID
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

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId: token.storeId as string,
      },
      include: {
        variants: true,
        inventoryItems: {
          select: {
            quantity: true,
            batchCode: true,
            expiryDate: true,
          },
        },
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

    // Calculate total stock
    const totalStock = product.inventoryItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { ...product, currentStock: totalStock },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get product error:', error);
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

// PUT /api/products/[id] - Update product
export async function PUT(
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
    const validationResult = updateProductSchema.safeParse(body);
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

    const data = validationResult.data;

    // Check if product exists and belongs to user's store
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId: token.storeId as string,
      },
    });

    if (!existingProduct) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Produk tidak ditemukan' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        unit: data.unit,
        priceSell: data.priceSell,
        priceCost: data.priceCost,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: updatedProduct,
        message: 'Produk berhasil diperbarui',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update product error:', error);
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

// DELETE /api/products/[id] - Soft delete product
export async function DELETE(
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
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId: token.storeId as string,
      },
    });

    if (!existingProduct) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Produk tidak ditemukan' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Soft delete (set isActive to false)
    await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Produk berhasil dihapus',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
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
