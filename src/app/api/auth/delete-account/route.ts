import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token?.sub || !token?.storeId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Password harus diisi untuk konfirmasi' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: token.sub as string },
      select: { passwordHash: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User tidak ditemukan' } },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PASSWORD', message: 'Password salah' } },
        { status: 400 }
      );
    }

    const storeCount = await prisma.user.count({
      where: { storeId: token.storeId as string, isActive: true },
    });

    if (storeCount <= 1 && user.role === 'OWNER') {
      await prisma.store.delete({
        where: { id: token.storeId as string },
      });
    } else {
      await prisma.user.update({
        where: { id: token.sub as string },
        data: { isActive: false },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan' } },
      { status: 500 }
    );
  }
}
