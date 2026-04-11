"use client";

import { useState, useMemo } from "react";
import ProductLeadButton from "../components/ProductLeadButton";

/* ── Types ───────────────────────────────────────────────── */
type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductSpecialty = {
  specialtyId: string;
  specialty: { name: string };
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  category: Category | null;
  categoryId: string;
  specialties: ProductSpecialty[];
};

type Props = {
  products: Product[];
  categories: Category[];
  userName: string;
  userEmail: string;
};

/* ── Component ───────────────────────────────────────────── */
export default function ProductCatalogClient({
  products,
  categories,
  userName,
  userEmail,
}: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeCategoryId) return products;
    return products.filter((p) => p.categoryId === activeCategoryId);
  }, [products, activeCategoryId]);

  return (
    <>
      {/* ── Category filter bar ──────────────────────────── */}
      {categories.length > 1 && (
        <nav
          id="catalog-category-filter"
          className="mb-8"
          aria-label="Filtrar por categoría"
        >
          <div className="flex flex-wrap gap-2">
            {/* "Todas" pill */}
            <button
              onClick={() => setActiveCategoryId(null)}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold
                border transition-all duration-200 select-none whitespace-nowrap
                ${
                  activeCategoryId === null
                    ? "bg-blue-700 text-white border-blue-700 shadow-md shadow-blue-700/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/50"
                }
              `}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
              Todas
              <span
                className={`ml-0.5 text-[10px] font-semibold ${
                  activeCategoryId === null
                    ? "text-white/70"
                    : "text-slate-400"
                }`}
              >
                {products.length}
              </span>
            </button>

            {/* Category pills */}
            {categories.map((cat) => {
              const count = products.filter(
                (p) => p.categoryId === cat.id
              ).length;
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setActiveCategoryId(isActive ? null : cat.id)
                  }
                  className={`
                    inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold
                    border transition-all duration-200 select-none whitespace-nowrap
                    ${
                      isActive
                        ? "bg-blue-700 text-white border-blue-700 shadow-md shadow-blue-700/20"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/50"
                    }
                  `}
                >
                  {cat.name}
                  <span
                    className={`text-[10px] font-semibold ${
                      isActive ? "text-white/70" : "text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ── Products grid ────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Sin productos en esta categoría
          </h3>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-4">
            No se encontraron productos publicados en la categoría seleccionada.
          </p>
          <button
            onClick={() => setActiveCategoryId(null)}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
          >
            ← Ver todas las categorías
          </button>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {filtered.map((prod) => (
            <article
              key={prod.id}
              id={`product-card-${prod.slug}`}
              className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
            >
              {/* ── Smart image container ──────────────── */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex-shrink-0 overflow-hidden">
                {prod.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="
                        absolute inset-0 w-full h-full
                        object-contain
                        p-4
                        transition-transform duration-500 ease-out
                        group-hover:scale-105
                      "
                      loading="lazy"
                    />
                    {/* Subtle vignette for polish */}
                    <div className="absolute inset-0 ring-1 ring-inset ring-slate-900/[0.04] rounded-none pointer-events-none" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-14 h-14 text-slate-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={0.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6h.008v.008H6V6z"
                      />
                    </svg>
                  </div>
                )}

                {/* Category badge overlay */}
                {prod.category && (
                  <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-slate-100/80 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider shadow-sm">
                    {prod.category.name}
                  </span>
                )}
              </div>

              {/* ── Content ────────────────────────────── */}
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-[15px] font-bold text-slate-900 leading-snug tracking-tight mb-2 line-clamp-2">
                  {prod.name}
                </h2>

                {prod.description && (
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">
                    {prod.description}
                  </p>
                )}

                {/* Specialty tags */}
                {prod.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {prod.specialties.slice(0, 3).map((s) => (
                      <span
                        key={s.specialtyId}
                        className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded font-medium"
                      >
                        {s.specialty.name}
                      </span>
                    ))}
                    {prod.specialties.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1 self-center">
                        +{prod.specialties.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* CTA — no detail page dependency */}
                <ProductLeadButton
                  productId={prod.id}
                  productSlug={prod.slug}
                  productName={prod.name}
                  prefillName={userName}
                  prefillEmail={userEmail}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Bottom CTA banner ────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 mb-0.5">
              ¿Buscas algo específico que no está en el catálogo?
            </p>
            <p className="text-xs text-slate-500">
              Tu asesor Gencell puede gestionar pedidos especializados para tu
              práctica.
            </p>
          </div>
          <a
            href="/profesional#form-atencion"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-150 whitespace-nowrap"
          >
            Pedido especial →
          </a>
        </div>
      )}
    </>
  );
}
