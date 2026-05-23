import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'startDate dan endDate harus diisi',
          },
        },
        { status: 400 }
      );
    }

    const where: any = {
      storeId: token.storeId as string,
      transactionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    // Calculate totals
    const totalRevenue = transactions.reduce(
      (sum, t) => sum + Number(t.totalAmount),
      0
    );
    const totalTransactions = transactions.length;
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Group by payment method
    const paymentMethodBreakdown = transactions.reduce((acc: any, t) => {
      const method = t.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count += 1;
      acc[method].total += Number(t.totalAmount);
      return acc;
    }, {});

    // Group by date
    const salesByDate: any = {};
    transactions.forEach((t) => {
      let dateKey: string;
      const date = new Date(t.transactionDate);

      if (groupBy === 'month') {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = weekStart.toISOString().split('T')[0];
      } else {
        dateKey = date.toISOString().split('T')[0];
      }

      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = {
          date: dateKey,
          revenue: 0,
          transactions: 0,
        };
      }

      salesByDate[dateKey].revenue += Number(t.totalAmount);
      salesByDate[dateKey].transactions += 1;
    });

    // Top products
    const productSales: any = {};
    transactions.forEach((t) => {
      t.items.forEach((item) => {
        const productId = item.productId;
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            productName: item.productName,
            category: item.product?.category,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += Number(item.subtotal);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalTransactions,
          averageTransaction,
        },
        paymentMethodBreakdown,
        salesByDate: Object.values(salesByDate),
        topProducts,
      },
    });
  } catch (error) {
    console.error('Sales report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan saat mengambil laporan',
        },
      },
      { status: 500 }
    );
  }
}
