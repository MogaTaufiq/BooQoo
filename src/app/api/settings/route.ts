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

    const store = await prisma.store.findUnique({
      where: { id: token.storeId as string },
      select: {
        id: true,
        name: true,
        description: true,
        phone: true,
        address: true,
        timezone: true,
        currency: true,
        settings: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Toko tidak ditemukan',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan saat mengambil pengaturan',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      name,
      description,
      phone,
      address,
      lowStockThreshold,
      expiryAlertDays,
    } = body;

    // Validate
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nama toko harus diisi',
          },
        },
        { status: 400 }
      );
    }

    if (lowStockThreshold !== undefined && lowStockThreshold < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Batas stok menipis harus >= 0',
          },
        },
        { status: 400 }
      );
    }

    if (expiryAlertDays !== undefined && expiryAlertDays < 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Peringatan kedaluwarsa minimal 1 hari',
          },
        },
        { status: 400 }
      );
    }

    // Get current settings
    const currentStore = await prisma.store.findUnique({
      where: { id: token.storeId as string },
    });

    const currentSettings = (currentStore?.settings as any) || {};

    // Update store
    const updatedStore = await prisma.store.update({
      where: { id: token.storeId as string },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        settings: {
          ...currentSettings,
          lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : currentSettings.lowStockThreshold || 10,
          expiryAlertDays: expiryAlertDays !== undefined ? expiryAlertDays : currentSettings.expiryAlertDays || 7,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedStore,
      message: 'Pengaturan berhasil disimpan',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan saat menyimpan pengaturan',
        },
      },
      { status: 500 }
    );
  }
}
