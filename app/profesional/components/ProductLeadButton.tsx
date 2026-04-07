"use client";

import { useState } from "react";
import LeadCTA from "./LeadCTA";

interface Props {
  productId: string;
  productSlug: string;
  productName: string;
  prefillName?: string;
  prefillEmail?: string;
}

export default function ProductLeadButton({ productId, productSlug, productName, prefillName = "", prefillEmail = "" }: Props) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100">
        <LeadCTA
          sourceType="PRODUCT_CTA"
          sourceId={productId}
          sourceLabel={productName}
          defaultIntent="ORDER_REQUEST"
          defaultOpen
          prefillName={prefillName}
          prefillEmail={prefillEmail}
          productName={productName}
        />
      </div>
    );
  }

  return (
    <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
      <a
        href={`/profesional/productos/${productSlug}`}
        className="text-center text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg py-2 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
      >
        Ver detalle
      </a>
      <button
        onClick={() => setOpen(true)}
        className="text-center text-xs font-bold text-white bg-blue-700 rounded-lg py-2 hover:bg-blue-800 transition-all duration-150"
      >
        Solicitar →
      </button>
    </div>
  );
}
