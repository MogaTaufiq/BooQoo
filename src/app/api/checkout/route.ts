import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token?.storeId || !token?.userId) {
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

    const body = await request.json();
    const {
      items,
      paymentMethod,
      amountPaid,
      customerName,
    } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Items tidak boleh kosong',
          },
        },
        { status: 400 }
      );
    }

    if (!paymentMethod || !['CASH', 'TRANSFER', 'E_WALLET'].includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Metode pembayaran tidak valid',
          },
        },
        { status: 400 }
      );
    }

    // Calculate totals and validate stock
    let totalAmount = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const { productId, variantId, quantity, price } = item;

      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Data item tidak valid',
            },
          },
          { status: 400 }
        );
      }

      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: productId, storeId: token.storeId as string },
      });

      if (!product || !product.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: `Produk tidak ditemukan atau tidak aktif`,
            },
          },
          { status: 404 }
        );
      }

      // Check stock availability
      const inventoryItems = await prisma.inventoryItem.findMany({
        where: {
          productId,
          variantId: variantId || null,
          storeId: token.storeId as string,
        },
      });

      const totalStock = inventoryItems.reduce((sum: number, inv: any) => sum + inv.quantity, 0);

      if (totalStock < quantity) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: `Stok tidak mencukupi untuk ${product.name}. Tersedia: ${totalStock}, Diminta: ${quantity}`,
            },
          },
          { status: 400 }
        );
      }

      // Use provided price or product price
      const itemPrice = price || Number(product.priceSell);
      const subtotal = itemPrice * quantity;
      totalAmount += subtotal;

      validatedItems.push({
        productId,
        variantId: variantId || null,
        productName: product.name,
        quantity,
        price: itemPrice,
        subtotal,
        inventoryItems,
      });
    }

    // Validate payment
    const parsedAmountPaid = parseFloat(amountPaid || totalAmount);

    if (parsedAmountPaid < totalAmount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PAYMENT',
            message: `Pembayaran kurang. Total: ${totalAmount}, Dibayar: ${parsedAmountPaid}`,
          },
        },
        { status: 400 }
      );
    }

    const changeAmount = parsedAmountPaid - totalAmount;

    // Create transaction in a database transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create transaction record
      const now = new Date();
      const transaction = await tx.transaction.create({
        data: {
          storeId: token.storeId as string,
          createdBy: token.userId as string,
          transactionDate: now,
          createdAtLocal: now,
          totalAmount,
          paymentMethod: paymentMethod === 'CASH' ? 'CASH' : paymentMethod === 'TRANSFER' ? 'TRANSFER_BCA' : 'EWALLET_GOPAY',
          amountReceived: parsedAmountPaid,
          changeAmount,
          notes: customerName ? `Customer: ${customerName}` : null,
        },
      });

      // Create transaction details and update stock
      for (const item of validatedItems) {
        // Create transaction detail
        await tx.transactionDetail.create({
          data: {
            transactionId: transaction.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: null,
            quantity: item.quantity,
            priceUnit: item.price,
            subtotal: item.subtotal,
            batchCodeUsed: null,
          },
        });

        // Deduct stock using FIFO (oldest first)
        let remainingQuantity = item.quantity;
        const sortedInventory = item.inventoryItems.sort(
          (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        for (const invItem of sortedInventory) {
          if (remainingQuantity <= 0) break;

          const deductQuantity = Math.min(invItem.quantity, remainingQuantity);

          // Update inventory item
          await tx.inventoryItem.update({
            where: { id: invItem.id },
            data: { quantity: invItem.quantity - deductQuantity },
          });

          // Create stock movement record
          await tx.stockMovement.create({
            data: {
              storeId: token.storeId as string,
              productId: item.productId,
              variantId: item.variantId,
              type: 'SALE',
              quantity: -deductQuantity,
              reason: `Penjualan - Transaksi #${transaction.id.slice(0, 8)}`,
              performedBy: token.userId as string,
              referenceId: transaction.id,
            },
          });

          remainingQuantity -= deductQuantity;
        }
      }

      return transaction;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          transactionId: result.id,
          totalAmount: result.totalAmount,
          amountPaid: result.amountReceived,
          changeAmount: result.changeAmount,
          paymentMethod: result.paymentMethod,
          createdAt: result.transactionDate,
        },
        message: 'Transaksi berhasil',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan saat memproses transaksi',
        },
      },
      { status: 500 }
    );
  }
}
