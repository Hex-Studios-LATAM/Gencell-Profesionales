import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().optional(),
  description: z.string().optional()
});

export async function GET() {
  try {
    const data = await prisma.specialty.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    
    const data = result.data;
    const finalSlug = data.slug || generateSlug(data.name);

    const existing = await prisma.specialty.findUnique({ where: { slug: finalSlug } });
    if (existing) return NextResponse.json({ error: "El slug ya existe" }, { status: 400 });

    const created = await prisma.specialty.create({
      data: {
        name: data.name,
        slug: finalSlug,
        description: data.description || null
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
