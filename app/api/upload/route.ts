import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'DOCTOR'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'misc';

    if (!file) {
      return NextResponse.json({ error: 'No se incluyó ningún archivo' }, { status: 400 });
    }

    // Validación básica de tipo (solo imágenes)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 });
    }

    // Validación de tamaño (ej. máx 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'El archivo excede los 5MB permitidos' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Generar un nombre seguro y único
    const timestamp = Date.now();
    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${timestamp}-${safeOriginalName}`;

    // Ruta de guardado: public/uploads/{folder}/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    
    // Crear el directorio si no existe
    await fs.mkdir(uploadDir, { recursive: true });

    // Guardar el archivo localmente
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Retornar la URL pública
    const publicUrl = `/uploads/${folder}/${filename}`;

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error interno del servidor al subir archivo' }, { status: 500 });
  }
}
