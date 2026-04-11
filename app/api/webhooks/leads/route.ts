import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/webhooks/leads?token=xxx
 *
 * Recibe leads desde formularios externos (Elementor Pro, etc.)
 * Valida el token contra LeadOrigin para identificar la fuente.
 * Soporta: application/json, multipart/form-data, application/x-www-form-urlencoded.
 */
export async function POST(req: Request) {
  try {
    // ── 1. Validar token ─────────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const origin = await prisma.leadOrigin.findUnique({ where: { token } });

    if (!origin) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // ── 2. Parsear body según content-type ───────────────────────────
    const contentType = req.headers.get('content-type') || '';
    let body: Record<string, string> = {};

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        if (typeof value === 'string') {
          body[key] = value;
        }
      });
    } else {
      // Intentar JSON (default)
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { error: 'No se pudo parsear el body. Envía JSON o FormData.' },
          { status: 400 }
        );
      }
    }

    console.log('[Webhook Leads] Body recibido:', JSON.stringify(body));

    // ── 3. Extraer campos (mapeo flexible español/inglés) ────────────
    const nombre   = (body.nombre || body.name || body.full_name || '').trim();
    const cedula   = (body.cedula || body.cedula_profesional || body.license || '').trim();
    const email    = (body.email || body.correo || '').trim();
    const telefono = (body.telefono || body.phone || body.tel || body.whatsapp || '').trim();

    // ── 4. Validar campos requeridos ─────────────────────────────────
    const missing: string[] = [];
    if (!nombre)   missing.push('nombre');
    if (!cedula)   missing.push('cedula');
    if (!email)    missing.push('email');
    if (!telefono) missing.push('telefono');

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // ── 5. Crear lead en BD ──────────────────────────────────────────
    const lead = await prisma.lead.create({
      data: {
        nombre,
        cedula,
        email,
        telefono,
        originId: origin.id,
      },
    });

    console.log(`[Webhook Leads] Lead creado: ${lead.id} — ${email} — Origen: ${origin.name}`);
    return NextResponse.json({ success: true, message: 'Lead creado', leadId: lead.id }, { status: 201 });

  } catch (error) {
    console.error('Webhook Error Detallado:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
