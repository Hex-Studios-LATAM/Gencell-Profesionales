"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button 
      onClick={async () => {
         setLoading(true);
         await signOut({ callbackUrl: "/login" });
      }} 
      disabled={loading}
      className="w-full mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 py-2.5 rounded-lg transition disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      {loading ? 'Saliendo...' : 'Cerrar Sesión'}
    </button>
  );
}
