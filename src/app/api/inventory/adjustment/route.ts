// ============================================
// Inventory API - Stock Adjustment
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { stockAdjustmentSchema } from '@/lib/validators/schemas';
import type { ApiResponse } from '@/types';

// POST /api/inventory/adjustment - Adjust stock (manual correction)
export async function POST(request: NextRequest) {
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
    const validationResult = stockAdjustmentSchema.safeParse(body);
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
    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
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

    // Adjust stock in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get or create inventory item
      let inventoryItem = await tx.inventoryItem.findFirst({
        where: {
          storeId: token.storeId as string,
          productId: data.productId,
          variantId: data.variantId || null,
          batchCode: null, // For adjustments, use the default batch
        },
      });

      if (!inventoryItem) {
        // Create new inventory item if doesn't exist
        inventoryItem = await tx.inventoryItem.create({
          data: {
            storeId: token.storeId as string,
            productId: data.productId,
            variantId: data.variantId,
            quantity: Math.max(0, data.quantity), // Ensure non-negative
            lastCountedAt: new Date(),
          },
        });
      } else {
        // Update existing inventory item
        const newQuantity = inventoryItem.quantity + data.quantity;

        if (newQuantity < 0) {
          throw new Error('Penyesuaian akan menghasilkan stok negatif');
        }

        inventoryItem = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQuantity,
            lastCountedAt: new Date(),
          },
        });
      }

      // Record stock movement
      const stockMovement = await tx.stockMovement.create({
        data: {
          storeId: token.storeId as string,
          productId: data.productId,
          variantId: data.variantId,
          type: 'ADJUSTMENT',
          quantity: Math.abs(data.quantity),
          reason: `${data.reason}${data.notes ? ': ' + data.notes : ''}`,
          referenceId: inventoryItem.id,
          performedBy: token.id as string,
        },
      });

      return { inventoryItem, stockMovement };
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: result.inventoryItem,
        message: 'Stok berhasil disesuaikan',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Stock adjustment error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Terjadi kesalahan'
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
