// ============================================
// Products API - List & Create
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { createProductSchema } from '@/lib/validators/schemas';
import type { ApiResponse, PaginatedResponse } from '@/types';

export const dynamic = 'force-dynamic';

// GET /api/products - List products with pagination and filters
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      storeId: token.storeId as string,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get products with variants
    const [productsRaw, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    // Transform products to include 'price' field for frontend compatibility
    const products = productsRaw.map((product) => ({
      ...product,
      price: Number(product.priceSell), // Add price field from priceSell
      priceSell: Number(product.priceSell),
      priceCost: product.priceCost ? Number(product.priceCost) : null,
      variants: product.variants?.map((variant) => ({
        ...variant,
        price: Number(product.priceSell) + Number(variant.priceModifier || 0),
        priceModifier: Number(variant.priceModifier || 0),
      })),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<PaginatedResponse<typeof products[0]>>(
      {
        success: true,
        data: products,
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
    console.error('Get products error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan saat mengambil produk' },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
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
    const validationResult = createProductSchema.safeParse(body);
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

    // Generate SKU if not provided
    const sku = data.sku || `PRD-${Date.now()}`;

    // Check for duplicate SKU
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'DUPLICATE_SKU',
            message: 'SKU sudah digunakan',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Create product with variants in transaction
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          storeId: token.storeId as string,
          name: data.name,
          sku,
          description: data.description,
          category: data.category,
          unit: data.unit,
          priceSell: data.priceSell,
          priceCost: data.priceCost,
          imageUrl: data.imageUrl,
          isActive: true,
        },
      });

      // Create variants if provided
      if (data.variants && data.variants.length > 0) {
        await tx.productVariant.createMany({
          data: data.variants.map((v: any) => ({
            productId: newProduct.id,
            name: v.name,
            skuSuffix: v.skuSuffix,
            priceModifier: v.priceModifier || 0,
          })),
        });
      }

      // Create initial inventory item
      await tx.inventoryItem.create({
        data: {
          storeId: token.storeId as string,
          productId: newProduct.id,
          quantity: 0,
        },
      });

      return newProduct;
    });

    // Fetch product with variants
    const productWithVariants = await prisma.product.findUnique({
      where: { id: product.id },
      include: { variants: true },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: productWithVariants,
        message: 'Produk berhasil dibuat',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan saat membuat produk' },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
