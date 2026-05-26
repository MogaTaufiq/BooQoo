import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

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

    // Get store settings
    const store = await prisma.store.findUnique({
      where: { id: token.storeId as string },
    });

    const settings = (store?.settings as any) || {};
    const lowStockThreshold = settings.lowStockThreshold || 10;
    const expiryAlertDays = settings.expiryAlertDays || 7;

    // Get all products with inventory
    const products = await prisma.product.findMany({
      where: {
        storeId: token.storeId as string,
        isActive: true,
      },
      include: {
        inventoryItems: true,
      },
    });

    const now = new Date();
    const inventoryReport: any[] = [];
    let totalValue = 0;
    let lowStockCount = 0;
    let expiringCount = 0;

    products.forEach((product) => {
      const totalStock = product.inventoryItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const isLowStock = totalStock <= lowStockThreshold;
      if (isLowStock && totalStock > 0) lowStockCount++;

      // Check expiry
      const hasExpiringSoon = product.inventoryItems.some((item) => {
        if (!item.expiryDate) return false;
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiryDate).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= expiryAlertDays && daysUntilExpiry > 0;
      });

      if (hasExpiringSoon) expiringCount++;

      // Calculate value
      const productValue = totalStock * Number(product.priceSell);
      totalValue += productValue;

      inventoryReport.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        unit: product.unit,
        totalStock,
        isLowStock,
        hasExpiringSoon,
        priceSell: Number(product.priceSell),
        priceCost: product.priceCost ? Number(product.priceCost) : null,
        totalValue: productValue,
      });
    });

    // Sort by value descending
    inventoryReport.sort((a, b) => b.totalValue - a.totalValue);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalProducts: products.length,
          totalValue,
          lowStockCount,
          expiringCount,
        },
        products: inventoryReport,
      },
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan saat mengambil laporan inventori',
        },
      },
      { status: 500 }
    );
  }
}
