// ============================================
// Inventory API - Current Stock Levels
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

// GET /api/inventory - Get current stock levels for all products
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    const expiringSoon = searchParams.get('expiringSoon') === 'true';

    // Get store settings for thresholds
    const store = await prisma.store.findUnique({
      where: { id: token.storeId as string },
    });

    const lowStockThreshold = (store?.settings as any)?.lowStockThreshold || 10;
    const expiryAlertDays = (store?.settings as any)?.expiryAlertDays || 7;

    // Build where clause for products
    const productWhere: any = {
      storeId: token.storeId as string,
      isActive: true,
    };

    if (search) {
      productWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get all products with inventory items
    const products = await prisma.product.findMany({
      where: productWhere,
      include: {
        variants: true,
        inventoryItems: {
          where: {
            quantity: { gt: 0 },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculate total stock and prepare response
    const inventoryData = products.map((product) => {
      const totalStock = product.inventoryItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const batches = product.inventoryItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        batchCode: item.batchCode,
        expiryDate: item.expiryDate,
        daysUntilExpiry: item.expiryDate
          ? Math.ceil(
              (new Date(item.expiryDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      }));

      const isLowStock = totalStock <= lowStockThreshold;
      const hasExpiringSoon = batches.some(
        (b) => b.daysUntilExpiry !== null && b.daysUntilExpiry <= expiryAlertDays
      );

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unit: product.unit,
        category: product.category,
        totalStock,
        isLowStock,
        hasExpiringSoon,
        batches,
        variants: product.variants,
      };
    });

    // Apply filters
    let filteredData = inventoryData;
    if (lowStock) {
      filteredData = filteredData.filter((item) => item.isLowStock);
    }
    if (expiringSoon) {
      filteredData = filteredData.filter((item) => item.hasExpiringSoon);
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: filteredData,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get inventory error:', error);
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
