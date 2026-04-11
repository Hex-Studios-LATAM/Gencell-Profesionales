import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// Fields to return to the client (explicitly exclude sensitive data)
const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  professionalLicense: true,
  profileImage: true,
  status: true,
  specialty: { select: { id: true, name: true } },
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: userSelect,
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error fetching profile:', error?.message ?? error);
    return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const userId = session.user.id;

    // Validate user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { phone, profileImage } = body;

    // Build update payload with only allowed fields
    const dataToUpdate: Record<string, string> = {};
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (profileImage !== undefined) dataToUpdate.profileImage = profileImage;

    // If nothing to update, return current user
    if (Object.keys(dataToUpdate).length === 0) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: userSelect,
      });
      return NextResponse.json(currentUser);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: userSelect,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating profile:', error?.message ?? error);
    return NextResponse.json(
      { error: error?.message ?? 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}
