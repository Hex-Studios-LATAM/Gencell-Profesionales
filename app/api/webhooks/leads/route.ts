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

    // ── 2. Parsear body de forma extra robusta ───────────────────────
    const rawText = await req.text();
    let data: Record<string, string> = {};

    if (rawText.trim().startsWith('{')) {
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        // Fallback silently
      }
    }

    if (Object.keys(data).length === 0) {
      const params = new URLSearchParams(rawText);
      data = Object.fromEntries(params.entries());
    }

    // ── 3. Extraer campos (mapeo flexible español/inglés/mayus) ──────
    const nombre   = (data.nombre || data.Nombre || data['Nombre '] || data.name || data.full_name || '').trim();
    const cedula   = (data.cedula || data.Cedula || data['Cédula Profesional'] || data.cedula_profesional || data.license || '').trim();
    const email    = (data.email || data.Email || data['Correo Electrónico'] || data.correo || '').trim();
    const telefono = (data.telefono || data.Telefono || data['Teléfono'] || data.phone || data.tel || data.whatsapp || '').trim();
    const pageUrl  = (data._url || data.url || data.page_url || data.referrer || '').trim() || null;

    console.log("Datos extraídos:", { nombre, cedula, email, telefono, pageUrl });

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
        pageUrl,
        originId: origin.id,
      },
    });

    console.log(`[Webhook Leads] Lead creado: ${lead.id} — ${email} — Origen: ${origin.name} — URL: ${pageUrl || 'N/A'}`);
    // Elementor requiere status 200 para mostrar mensaje de éxito verde
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook Error Detallado:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
