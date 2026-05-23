import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request });

    if (!token?.storeId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized',
          },
        },
        { status: 401 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
        storeId: token.storeId as string,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                unit: true,
              },
            },
            variant: {
              select: {
                name: true,
              },
            },
          },
        },
        createdByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Transaksi tidak ditemukan',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Get transaction detail error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan saat mengambil detail transaksi',
        },
      },
      { status: 500 }
    );
  }
}
