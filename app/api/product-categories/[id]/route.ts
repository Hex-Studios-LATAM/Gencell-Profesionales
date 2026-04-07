import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().optional(),
  logoUrl: z.string().optional()
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await prisma.productCategory.findUnique({ where: { id } });
    if (!data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    
    const data = result.data;
    const finalSlug = data.slug || generateSlug(data.name);

    const existing = await prisma.productCategory.findUnique({ where: { slug: finalSlug } });
    if (existing && existing.id !== id) {
       return NextResponse.json({ error: "El slug ya existe" }, { status: 400 });
    }

    const updated = await prisma.productCategory.update({
      where: { id },
      data: { name: data.name, slug: finalSlug, logoUrl: data.logoUrl }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.productCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
