// ============================================
// Inventory API - Stock Movement History
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse, PaginatedResponse } from '@/types';

export const dynamic = 'force-dynamic';

// GET /api/inventory/history - Get stock movement history
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const productId = searchParams.get('productId') || '';
    const type = searchParams.get('type') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      storeId: token.storeId as string,
    };

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Get stock movements with related data
    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              unit: true,
            },
          },
          performedByUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<PaginatedResponse<typeof movements[0]>>(
      {
        success: true,
        data: movements,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get stock history error:', error);
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
