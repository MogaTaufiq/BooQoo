import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/db/prisma';

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token?.sub) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Nama harus diisi' } },
        { status: 400 }
      );
    }

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== token.sub) {
        return NextResponse.json(
          { success: false, error: { code: 'EMAIL_EXISTS', message: 'Email sudah digunakan' } },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: token.sub as string },
      data: {
        name: name.trim(),
        ...(email ? { email } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        storeId: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Profil berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan' } },
      { status: 500 }
    );
  }
}
