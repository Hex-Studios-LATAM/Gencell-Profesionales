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
    <div className="mt-auto pt-4 border-t border-slate-100">
      <button
        onClick={() => setOpen(true)}
        className="w-full text-center text-xs font-bold text-white bg-blue-700 rounded-lg py-2.5 hover:bg-blue-800 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Solicitar información
      </button>
    </div>
  );
}
