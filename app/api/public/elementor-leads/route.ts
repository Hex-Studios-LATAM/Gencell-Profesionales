import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/public/elementor-leads
 *
 * Endpoint webhook legacy para recibir leads de formularios Elementor.
 * Requiere el header `x-webhook-secret` con el valor de ELEMENTOR_WEBHOOK_SECRET.
 * Los leads se guardan con el modelo simplificado: nombre, cedula, email, telefono.
 *
 * NOTA: El endpoint preferido es /api/webhooks/leads?token=xxx (basado en LeadOrigin).
 * Este endpoint se conserva por compatibilidad con formularios ya configurados.
 */
export async function POST(req: Request) {
  // ── 1. Validar secret ──────────────────────────────────────────────
  const incomingSecret = req.headers.get('x-webhook-secret');
  const expectedSecret = process.env.ELEMENTOR_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error('[elementor-leads] ELEMENTOR_WEBHOOK_SECRET no está configurado');
    return NextResponse.json({ error: 'Endpoint no configurado' }, { status: 503 });
  }

  if (!incomingSecret || incomingSecret !== expectedSecret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // ── 2. Parsear body ────────────────────────────────────────────────
  let body: Record<string, any> = {};
  try {
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => { body[key] = value; });
    } else {
      try { body = await req.json(); } catch { /* ignore */ }
    }
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  // ── 3. Extraer campos ──────────────────────────────────────────────
  const extract = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = body[k] ?? body[`fields[${k}][value]`];
      if (v && typeof v === 'string' && v.trim()) return v.trim();
    }
    return undefined;
  };

  const nombre   = extract(['name', 'nombre', 'full_name', 'nombre_completo', 'your-name']) ?? 'Sin nombre';
  const email    = extract(['email', 'correo', 'your-email', 'email_address']);
  const cedula   = extract(['cedula', 'cedula_profesional', 'license', 'professional_license']) ?? '';
  const telefono = extract(['phone', 'tel', 'telefono', 'teléfono', 'mobile', 'your-phone']) ?? '';

  // ── 4. Validar email mínimo ────────────────────────────────────────
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email es requerido y debe ser válido' }, { status: 400 });
  }

  // ── 5. Buscar o crear un LeadOrigin para este endpoint ─────────────
  // Usa un origen "legacy" fijo para este endpoint de compatibilidad
  const originName = extract(['website_name', 'site_name', 'sitio']) ?? 'Elementor (Legacy)';

  let origin = await prisma.leadOrigin.findFirst({ where: { name: originName } });
  if (!origin) {
    origin = await prisma.leadOrigin.create({
      data: {
        name: originName,
        token: `legacy-${crypto.randomUUID()}`,
      },
    });
  }

  // ── 6. Guardar en BD ───────────────────────────────────────────────
  try {
    const lead = await prisma.lead.create({
      data: {
        nombre,
        cedula,
        email,
        telefono,
        status: 'NUEVO',
        originId: origin.id,
      },
    });

    console.log(`[elementor-leads] Lead creado: ${lead.id} — ${email}`);
    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (err) {
    console.error('[elementor-leads] Error al guardar lead:', err);
    return NextResponse.json({ error: 'Error interno al guardar lead' }, { status: 500 });
  }
}
