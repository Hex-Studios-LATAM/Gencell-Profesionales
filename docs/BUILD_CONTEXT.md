# Gencell Profesionales — Contexto de construcción

## Objetivo
Construir una app web para profesionales de la salud con dos áreas:
1. Sitio público
2. Área administrativa y profesional

## Stack fijo
- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL en Docker
- Prisma 6
- No Prisma 7
- No prisma.config.ts
- Despliegue futuro en VPS

## Estado actual
- Proyecto Next.js ya creado
- Proyecto corre en localhost:3000
- PostgreSQL ya corre en Docker
- Prisma 6 ya funciona
- Prisma Studio ya abre

## Seguridad y Persistencia (VPS y Docker)
- **Persistencia de BD:** Usar explícitamente el volumen nombrado `postgres_data` montado en `/var/lib/postgresql/data` dentro de `docker-compose.yml` para evitar barrido de datos al regenerar contenedores.
- **PELIGRO CRÍTICO:** ESTÁ ESTRICTAMENTE PROHIBIDO ejecutar `npx prisma db push` en entornos de producción o VPS. Este comando puede resetear tablas silenciosamente y borrar datos reales de doctores y leads.

## Flujo de Despliegue y Arquitectura
- **Locales:** Puedes experimentar estructurando la base de datos con `npx prisma db push` de forma aislada, o crear migraciones nuevas con `npx prisma migrate dev --name <nombre>`.
- **Producción:** Se utiliza **SIEMPRE** el comando `npm run db:migrate:prod` (que ejecuta `npx prisma migrate deploy`). Este comando aplica las migraciones de forma segura al levantar el contenedor de la aplicación.

## Principios
- Navegación extremadamente simple
- Admin primero funcional, luego refinamiento visual
- No saturación visual
- No rehacer estructura sin justificación
- No introducir dependencias innecesarias
- Optimizar prompts para Antigravity

## Fase 1
- Especialidades
- Categorías de artículos
- Categorías de productos
- Artículos
- Productos
- Admin funcional
- Sitio público básico

## Restricciones de fase 1
- Imágenes solo por URL (imageUrl)
- Sin uploads binarios
- Sin rich text editor
- Contenido simple tipo textarea/markdown básico
- Sin pagos
- Sin pacientes ni expedientes
- Sin multilenguaje
- Sin auth en la primera construcción base

## Roles futuros
- ADMIN
- DOCTOR

## Estados
- DRAFT
- PUBLISHED

## Rutas objetivo
### Públicas
- /
- /articulos
- /articulos/[slug]
- /productos
- /productos/[slug]

### Admin
- /admin
- /admin/especialidades
- /admin/categorias/articulos
- /admin/categorias/productos
- /admin/articulos
- /admin/productos

### Profesional (fase posterior)
- /profesional
- /profesional/articulos
- /profesional/productos

## Regla para Antigravity
- Cambia solo lo necesario
- No rehagas el proyecto
- No metas librerías extra si no son indispensables
- Devuelve resumen corto y archivos modificados