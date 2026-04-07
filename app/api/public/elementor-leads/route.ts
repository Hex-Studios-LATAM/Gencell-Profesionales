import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/public/elementor-leads
 *
 * Endpoint webhook para recibir leads de formularios Elementor (o cualquier
 * sitio externo). Requiere el header `x-webhook-secret` con el valor
 * de la variable de entorno ELEMENTOR_WEBHOOK_SECRET.
 *
 * Payload esperado (todos opcionales salvo email):
 * {
 *   name        : string   – nombre del contacto
 *   email       : string   – email (requerido)
 *   phone       : string   – teléfono
 *   message     : string   – mensaje libre
 *   form_name   : string   – nombre del formulario en Elementor
 *   page_url    : string   – URL de la página donde está el formulario
 *   website_name: string   – nombre del sitio web (ej. "Gencell Corp")
 *   utm_source  : string
 *   utm_medium  : string
 *   utm_campaign: string
 *   [cualquier otro campo]: se guarda en rawPayload para auditoría
 * }
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
      // Elementor puede enviar form-urlencoded según configuración
      const text = await req.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => { body[key] = value; });
    } else {
      // Intentar JSON de todas formas
      try { body = await req.json(); } catch { /* ignore */ }
    }
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  // ── 3. Extraer campos conocidos (Elementor usa distintas claves según widget)
  // Elementor Pro Webhook envía: fields[key][value] y también form_id, form_name, etc.
  // Soportamos el formato plano y el formato Elementor anidado.
  const extract = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = body[k] ?? body[`fields[${k}][value]`];
      if (v && typeof v === 'string' && v.trim()) return v.trim();
    }
    return undefined;
  };

  const name    = extract(['name', 'nombre', 'full_name', 'nombre_completo', 'your-name']) ?? 'Sin nombre';
  const email   = extract(['email', 'correo', 'your-email', 'email_address']);
  const phone   = extract(['phone', 'tel', 'telefono', 'teléfono', 'mobile', 'your-phone']);
  const message = extract(['message', 'mensaje', 'comments', 'your-message', 'msg', 'consulta']);

  // Metadatos del formulario
  const formName   = extract(['form_name', 'form_id', 'form-name']) ?? 'Formulario Externo';
  const pageUrl    = extract(['page_url', 'referrer', 'source_url', 'page-url']) ?? req.headers.get('referer') ?? undefined;
  const websiteName = extract(['website_name', 'site_name', 'sitio']) ?? 'Sitio Web';

  // UTMs
  const utmSource   = extract(['utm_source']);
  const utmMedium   = extract(['utm_medium']);
  const utmCampaign = extract(['utm_campaign']);

  // ── 4. Validar email mínimo ────────────────────────────────────────
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email es requerido y debe ser válido' }, { status: 400 });
  }

  // ── 5. Guardar en BD ───────────────────────────────────────────────
  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        message,
        sourceType:  'ELEMENTOR_FORM',
        sourceLabel: formName,
        intent:      'GENERAL_INQUIRY',
        status:      'NEW',
        channel:     'WEBSITE',
        websiteName,
        formName,
        pageUrl,
        utmSource,
        utmMedium,
        utmCampaign,
        rawPayload:  body,
      },
    });

    console.log(`[elementor-leads] Lead creado: ${lead.id} — ${email} — ${formName}`);
    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (err) {
    console.error('[elementor-leads] Error al guardar lead:', err);
    return NextResponse.json({ error: 'Error interno al guardar lead' }, { status: 500 });
  }
}
