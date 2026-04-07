"use client";

import { useState } from "react";

type Intent = "PERSONALIZED_ATTENTION" | "ORDER_REQUEST" | "GENERAL_INQUIRY";

type Props = {
  sourceType: "HOME_CTA" | "PRODUCT_CTA" | "NEWS_CTA" | "WHITE_PAPER_CTA" | "ARTICLE_CTA";
  sourceLabel?: string;
  sourceId?: string;
  defaultIntent?: Intent;
  prefillName?: string;
  prefillEmail?: string;
  defaultOpen?: boolean;
  compact?: boolean;
  productName?: string;
};

export default function LeadCTA({
  sourceType,
  sourceLabel,
  sourceId,
  defaultIntent = "PERSONALIZED_ATTENTION",
  prefillName = "",
  prefillEmail = "",
  defaultOpen = false,
  compact = false,
  productName,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: prefillName,
    email: prefillEmail,
    phone: "",
    message: "",
    intent: defaultIntent,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sourceType, sourceId, sourceLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const firstName = prefillName?.split(" ")[0] || "Doctor";

  /* ── Éxito ─────────────────────────────────────── */
  if (success) {
    return (
      <div className={`${compact ? "bg-white/10 border border-white/20" : "bg-emerald-50 border border-emerald-200"} rounded-xl p-5 text-center`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${compact ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className={`font-bold text-base mb-1 ${compact ? "text-white" : "text-emerald-800"}`}>
          Solicitud recibida, Dr. {firstName}.
        </p>
        <p className={`text-sm leading-relaxed ${compact ? "text-white/70" : "text-emerald-700"}`}>
          Su asesor revisará el mensaje y le contactará en las próximas horas hábiles.
        </p>
      </div>
    );
  }

  /* ── Modo compact (sidebar del dashboard) ───────── */
  if (compact && !open) {
    return (
      <div className="space-y-2.5">
        <button
          onClick={() => { setForm(f => ({ ...f, intent: "PERSONALIZED_ATTENTION" })); setOpen(true); }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-blue-900/40"
        >
          Solicitar Atención Ahora →
        </button>
        <button
          onClick={() => { setForm(f => ({ ...f, intent: "ORDER_REQUEST" })); setOpen(true); }}
          className="w-full text-center text-xs text-white/50 hover:text-white/80 transition-colors py-1"
        >
          o realizar un pedido directamente
        </button>
      </div>
    );
  }

  /* ── Modo normal — botones colapsados ───────────── */
  if (!compact && !open) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => { setForm(f => ({ ...f, intent: "PERSONALIZED_ATTENTION" })); setOpen(true); }}
          className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-sm shadow-sm shadow-blue-900/20"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          Solicitar Atención
        </button>
        <button
          onClick={() => { setForm(f => ({ ...f, intent: "ORDER_REQUEST" })); setOpen(true); }}
          className="flex-1 border border-slate-200 text-slate-600 font-semibold px-5 py-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          Realizar Pedido
        </button>
      </div>
    );
  }

  /* ── Formulario expandido ───────────────────────── */
  const labelClass = `block text-xs font-semibold text-slate-600 mb-1 ${compact ? "text-white/70" : ""}`;
  const inputClass = `w-full border rounded-lg px-3 py-2 text-sm outline-none transition ${
    compact
      ? "border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/40"
      : "border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white"
  }`;

  return (
    <div className={compact ? "" : "bg-transparent"}>
      {!defaultOpen && (
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold text-[15px] ${compact ? "text-white" : "text-slate-900"}`}>
            {productName ? `Solicitar: ${productName}` : form.intent === "ORDER_REQUEST" ? "Realizar Pedido" : "Atención Personalizada"}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${compact ? "text-white/40 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+52 000 000 0000" />
        </div>
        <div>
          <label className={labelClass}>Mensaje</label>
          <textarea
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="¿Qué producto o servicio te interesa cotizar?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-2.5 rounded-xl transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm ${
            compact
              ? "bg-white text-blue-800 hover:bg-blue-50 font-bold"
              : "bg-blue-700 text-white hover:bg-blue-800 shadow-sm"
          }`}
        >
          {loading && (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? "Enviando" : "Solicitar Atención Ahora"}
        </button>

        <p className={`text-[11px] text-center flex items-center justify-center gap-1.5 ${compact ? "text-white/30" : "text-slate-400"}`}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          Información confidencial. Solo su asesor Gencell tiene acceso.
        </p>
      </form>
    </div>
  );
}
