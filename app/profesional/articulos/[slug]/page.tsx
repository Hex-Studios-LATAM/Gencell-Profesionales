import { redirect } from "next/navigation";

export default async function ArticulosSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/profesional/publicaciones/${slug}`);
}
