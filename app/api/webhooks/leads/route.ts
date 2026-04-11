import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/webhooks/leads?token=xxx
 *
 * Recibe leads desde formularios externos (Elementor Pro, etc.)
 * Valida el token contra LeadOrigin para identificar la fuente.
 */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const origin = await prisma.leadOrigin.findUnique({ where: { token } });

    if (!origin) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await req.json();

    // Mapeo flexible: soporta nombres en español e inglés
    const nombre   = body.nombre || body.name || body.full_name || '';
    const cedula   = body.cedula || body.cedula_profesional || body.license || '';
    const email    = body.email || body.correo || '';
    const telefono = body.telefono || body.phone || body.tel || body.whatsapp || '';

    if (!nombre || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        nombre,
        cedula,
        email,
        telefono,
        originId: origin.id,
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error('[Webhook Leads Error]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
