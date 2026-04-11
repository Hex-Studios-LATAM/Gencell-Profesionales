"use client";

import { useState, useEffect, useRef } from "react";

type ProfileData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  professionalLicense: string | null;
  profileImage: string | null;
  status: string;
  specialty?: { name: string } | null;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

export default function MiPerfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  
  const [phoneInput, setPhoneInput] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  
  const [nameInput, setNameInput] = useState("");
  const [isRequestingName, setIsRequestingName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Error obteniendo perfil");
      const data = await res.json();
      setProfile(data);
      setPhoneInput(data.phone || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdatePhone = async () => {
    setSavingPhone(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneInput })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error actualizando teléfono");
      }
      const data = await res.json();
      setProfile(data);
      setIsEditingPhone(false);
      showFeedback("success", "Teléfono actualizado correctamente.");
    } catch (e: any) {
      showFeedback("error", e.message);
    } finally {
      setSavingPhone(false);
    }
  };

  const handleRequestNameChange = async () => {
    if (!nameInput.trim()) {
      showFeedback("error", "Ingresa el nombre solicitado.");
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/profile/request-name-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedName: nameInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error solicitando cambio");
      showFeedback("success", "Solicitud de cambio de nombre enviada. Un administrador la revisará.");
      setIsRequestingName(false);
      setNameInput("");
    } catch (e: any) {
      showFeedback("error", e.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
       showFeedback("error", "La imagen excede 5 MB.");
       return;
    }

    setUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profiles");

    try {
      // 1. Upload image
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.error || "Error al subir la imagen");
      }
      const { url } = await res.json();

      // 2. Update profile with new image path
      const updateRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: url })
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(errData.error || "Error actualizando perfil");
      }
      
      const updatedProfile = await updateRes.json();
      setProfile(updatedProfile);
      showFeedback("success", "Foto de perfil actualizada.");
    } catch (err: any) {
      showFeedback("error", err.message);
    } finally {
      setUploadingImage(false);
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Cargando perfil...</div>;
  if (!profile) return <div className="p-8 text-red-500">{error || "Perfil no encontrado"}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mi Perfil</h1>
        <p className="text-slate-500 mt-2 font-medium">Gestiona tu información personal y profesional.</p>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          feedback.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {feedback.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {feedback.message}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="flex items-center gap-6">
             <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100 group">
                {profile.profileImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profile.profileImage} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">
                     {profile.name.charAt(0)}
                  </div>
                )}
                {/* Overlay on hover */}
                <div
                  onClick={() => !uploadingImage && fileInputRef.current?.click()}
                  className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${uploadingImage ? 'cursor-wait opacity-100' : 'cursor-pointer'}`}
                >
                   {uploadingImage ? (
                     <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   ) : (
                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                <p className="text-indigo-600 font-medium text-sm">{profile.specialty?.name || "Médico General"}</p>
                <div className="inline-block mt-2 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700">
                   {profile.status === 'ACTIVE' ? 'Cuenta Activa' : profile.status}
                </div>
             </div>
           </div>
        </div>

        <div className="p-8 space-y-8">
           {/* Info Sections */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                       <span className="text-slate-900 font-medium text-sm">{profile.name}</span>
                       <button onClick={() => setIsRequestingName(!isRequestingName)} className="text-xs text-indigo-600 font-bold hover:underline">
                         Solicitar Cambio
                       </button>
                    </div>
                    {isRequestingName && (
                       <div className="mt-3 bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                          <p className="text-xs text-slate-600 mb-3">Los cambios de nombre requieren validación administrativa. Ingresa el nombre correcto:</p>
                          <div className="flex gap-2">
                             <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} className="flex-1 text-sm border-slate-200 rounded-lg px-3 py-2 outline-none" placeholder="Nuevo nombre..." />
                             <button
                               onClick={handleRequestNameChange}
                               disabled={savingName}
                               className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-60"
                             >
                               {savingName ? "Enviando…" : "Enviar"}
                             </button>
                          </div>
                       </div>
                    )}
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Correo Electrónico (Solo Lectura)</label>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 cursor-not-allowed opacity-80">
                       <span className="text-slate-900 font-medium text-sm">{profile.email}</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teléfono de Contacto</label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                       {!isEditingPhone ? (
                          <>
                             <span className="text-slate-900 font-medium text-sm">{profile.phone || "No especificado"}</span>
                             <button onClick={() => setIsEditingPhone(true)} className="text-xs text-indigo-600 font-bold hover:underline">Editar</button>
                          </>
                       ) : (
                          <div className="flex w-full gap-2">
                             <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none" autoFocus />
                             <button
                               onClick={handleUpdatePhone}
                               disabled={savingPhone}
                               className="text-xs text-emerald-600 font-bold hover:underline disabled:opacity-60"
                             >
                               {savingPhone ? "…" : "Guardar"}
                             </button>
                             <button onClick={() => setIsEditingPhone(false)} className="text-xs text-slate-400 font-bold hover:underline">Cancelar</button>
                          </div>
                       )}
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cédula Profesional (Solo Lectura)</label>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 cursor-not-allowed opacity-80">
                       <span className="text-slate-900 font-medium text-sm">{profile.professionalLicense || "N/D"}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
