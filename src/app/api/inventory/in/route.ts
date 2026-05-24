// ============================================
// Inventory API - Stock In (Restock)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { stockInSchema } from '@/lib/validators/schemas';
import type { ApiResponse } from '@/types';

// POST /api/inventory/in - Add stock (restock)
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
    const validationResult = stockInSchema.safeParse(body);
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

    // Convert expiryDate string to Date if provided
    const expiryDate = data.expiryDate ? new Date(data.expiryDate) : undefined;

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

    // If variant provided, check it exists
    if (data.variantId) {
      const variant = await prisma.productVariant.findFirst({
        where: {
          id: data.variantId,
          productId: data.productId,
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
    }

    // Add stock in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if inventory item with same batch exists
      let inventoryItem = null;

      if (data.batchCode) {
        inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            storeId: token.storeId as string,
            productId: data.productId,
            variantId: data.variantId || null,
            batchCode: data.batchCode,
          },
        });
      }

      if (inventoryItem) {
        // Update existing inventory item
        inventoryItem = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: inventoryItem.quantity + data.quantity,
            lastCountedAt: new Date(),
          },
        });
      } else {
        // Create new inventory item
        inventoryItem = await tx.inventoryItem.create({
          data: {
            storeId: token.storeId as string,
            productId: data.productId,
            variantId: data.variantId || null,
            quantity: data.quantity,
            batchCode: data.batchCode || null,
            expiryDate: expiryDate,
            costPrice: data.costPrice,
            lastCountedAt: new Date(),
          },
        });
      }

      // Record stock movement
      const stockMovement = await tx.stockMovement.create({
        data: {
          storeId: token.storeId as string,
          productId: data.productId,
          variantId: data.variantId || null,
          type: 'IN',
          quantity: data.quantity,
          batchCode: data.batchCode || null,
          reason: 'Restock',
          referenceId: inventoryItem.id,
          performedBy: token.userId as string,
        },
      });

      return { inventoryItem, stockMovement };
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: result.inventoryItem,
        message: 'Stok berhasil ditambahkan',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Stock in error:', error);
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
