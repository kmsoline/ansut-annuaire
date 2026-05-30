"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MediaPicker from "@/app/components/MediaPicker";
import Image from "next/image";


export default function EditClientLogo() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState("");
  const [formData, setFormData] = useState({
    name:        "",
    logo_url:    "",
    website_url: "",
    sort_order:  0,
    active:      true,
    bg_white:    false,
  });

  useEffect(() => { loadLogo(); }, [id]);

  const loadLogo = async () => {
    try {
      const res = await fetch(`/api/admin/client-logos/${id}`);
      if (res.ok) {
        const d = await res.json();
        setFormData({
          name:        d.name        ?? "",
          logo_url:    d.logo_url    ?? d.logoUrl ?? "",
          website_url: d.website_url ?? d.website ?? "",
          sort_order:  d.sort_order  ?? d.order   ?? 0,
          active:      d.active      ?? true,
          bg_white:    d.bg_white    ?? false,
        });
      } else setError("Erreur lors du chargement");
    } catch { setError("Une erreur est survenue"); }
    finally { setIsLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/client-logos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) router.push("/admin/client-logos");
      else { const d = await res.json(); setError(d.error || "Erreur lors de la mise à jour"); }
    } catch { setError("Une erreur est survenue"); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--royal-blue)]" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Modifier le logo</h1>
        <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
          {formData.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass glass-strong rounded-xl p-6 space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
        )}

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-2">Nom du client *</label>
          <input name="name" type="text" value={formData.name} onChange={handleChange} required
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all" />
        </div>

        {/* Logo */}
        <MediaPicker
          value={formData.logo_url}
          onChange={url => setFormData(p => ({ ...p, logo_url: url }))}
          label="Logo *"
        />

        {/* Prévisualisation */}
        {formData.logo_url && (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
              Aperçu (tel qu'affiché sur le site)
            </p>
            <div
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 border border-white/10"
              style={{ background: formData.bg_white ? "#ffffff" : "color-mix(in oklch, var(--foreground) 5%, transparent)" }}
            >
              <Image
                src={formData.logo_url}
                alt={formData.name || "Logo"}
                width={200}
                height={72}
                style={{ height: 36, width: "auto" }}
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Fond blanc */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-white/8"
          style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)" }}>
          <input id="bg_white" name="bg_white" type="checkbox"
            checked={formData.bg_white} onChange={handleChange}
            className="mt-0.5 w-4 h-4 rounded" />
          <div>
            <label htmlFor="bg_white" className="text-sm font-medium cursor-pointer">Fond blanc</label>
            <p className="text-xs mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
              Utile pour les logos sombres — ajoute un fond blanc dans le carrousel
            </p>
          </div>
        </div>

        {/* Site web */}
        <div>
          <label className="block text-sm font-medium mb-2">Site web <span className="opacity-50 font-normal">(optionnel)</span></label>
          <input name="website_url" type="url" value={formData.website_url} onChange={handleChange}
            placeholder="https://example.com"
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all" />
        </div>

        {/* Ordre */}
        <div>
          <label className="block text-sm font-medium mb-2">Ordre d'affichage</label>
          <input name="sort_order" type="number" value={formData.sort_order} onChange={handleChange}
            className="w-32 px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all" />
        </div>

        {/* Actif */}
        <div className="flex items-center gap-2">
          <input id="active" name="active" type="checkbox" checked={formData.active} onChange={handleChange}
            className="w-4 h-4 rounded" />
          <label htmlFor="active" className="text-sm font-medium cursor-pointer">Visible sur le site</label>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={isSaving} className="btn btn-primary disabled:opacity-50">
            {isSaving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-outline">Annuler</button>
        </div>
      </form>
    </div>
  );
}
