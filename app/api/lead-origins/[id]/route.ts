import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;

    // No eliminar si tiene leads asociados
    const leadCount = await prisma.lead.count({ where: { originId: id } });
    if (leadCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: tiene ${leadCount} lead(s) asociados` },
        { status: 400 }
      );
    }

    await prisma.leadOrigin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
