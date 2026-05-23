// ============================================
// User Registration API Endpoint
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validators/schemas';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
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

    const { email, password, name, phone, storeName } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email sudah terdaftar',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and store in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create store first
      const store = await tx.store.create({
        data: {
          name: storeName,
          ownerId: 'temp', // Will be updated with user ID
          timezone: 'Asia/Jakarta',
          currency: 'IDR',
          settings: {
            lowStockThreshold: 10,
            expiryAlertDays: 7,
            enableBatchTracking: false,
            enableExpiryTracking: false,
            defaultPaymentMethod: 'CASH',
          },
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone: phone || null,
          storeId: store.id,
          role: 'OWNER',
          isActive: true,
        },
      });

      // Update store with correct owner ID
      await tx.store.update({
        where: { id: store.id },
        data: { ownerId: user.id },
      });

      return { user, store };
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            storeId: result.user.storeId,
          },
          store: {
            id: result.store.id,
            name: result.store.name,
          },
        },
        message: 'Akun berhasil dibuat',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan saat membuat akun',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
