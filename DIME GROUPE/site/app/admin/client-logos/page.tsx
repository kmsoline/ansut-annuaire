"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { LayoutGrid, List, Plus, RefreshCw, AlertTriangle, CheckCircle2, ImageOff, ExternalLink, Pencil, Trash2, Eye, EyeOff, ZoomIn, ZoomOut, Save } from "lucide-react";
import ViewModeToggle, { type ViewMode } from "@/app/components/admin/ViewModeToggle";
import { useViewMode } from "@/lib/use-view-mode";

interface ClientLogo {
  id: string;
  name: string;
  logo_url?: string;
  logoUrl?: string;  // fallback alias
  website_url?: string;
  website?: string;  // fallback alias
  sort_order?: number;
  order?: number;
  active: boolean;
  _fallback?: boolean;
}

function logoUrl(l: ClientLogo) { return l.logo_url ?? l.logoUrl ?? ""; }
function logoWebsite(l: ClientLogo) { return l.website_url ?? l.website ?? ""; }
function logoOrder(l: ClientLogo) { return l.sort_order ?? l.order ?? 999; }

export default function AdminClientLogos() {
  const [logos,       setLogos]       = useState<ClientLogo[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [seeding,     setSeeding]     = useState(false);
  const [seedMsg,     setSeedMsg]     = useState("");
  const [isFallback,  setIsFallback]  = useState(false);
  const [viewMode,    setViewMode]    = useViewMode("client-logos", "cards");
  const [logoHeight,  setLogoHeight]  = useState(36);
  const [sizeSaved,   setSizeSaved]   = useState(false);

  useEffect(() => { loadLogos(); loadSize(); }, []);

  const loadSize = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const d = await res.json();
        if (d.client_logos_height) setLogoHeight(Number(d.client_logos_height));
      }
    } catch { /* silencieux */ }
  };

  const saveSize = useCallback(async (h: number) => {
    setSizeSaved(false);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_logos_height: String(h) }),
    });
    setSizeSaved(true);
    setTimeout(() => setSizeSaved(false), 2000);
  }, []);

  const loadLogos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/client-logos");
      if (res.ok) {
        const data: ClientLogo[] = await res.json();
        setLogos(data);
        setIsFallback(data.some((d) => d._fallback));
      } else {
        setError("Erreur lors du chargement des logos");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const seedLogos = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/admin/client-logos/seed", { method: "POST" });
      const data = await res.json();
      setSeedMsg(data.message ?? "Synchronisation effectuée");
      await loadLogos();
    } catch {
      setSeedMsg("Erreur lors de la synchronisation");
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce logo ?")) return;
    try {
      const res = await fetch(`/api/admin/client-logos/${id}`, { method: "DELETE" });
      if (res.ok) setLogos(logos.filter((l) => l.id !== id));
      else alert("Erreur lors de la suppression");
    } catch { alert("Une erreur est survenue"); }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/client-logos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (res.ok) setLogos(logos.map((l) => (l.id === id ? { ...l, active: !active } : l)));
    } catch { alert("Une erreur est survenue"); }
  };

  const filtered = logos
    .filter((l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      logoWebsite(l).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => logoOrder(a) - logoOrder(b));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--royal-blue)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Logos clients</h1>
          <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
            {logos.length} logo{logos.length > 1 ? "s" : ""} · affiché sur la page d'accueil
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isFallback && (
            <button
              onClick={seedLogos}
              disabled={seeding}
              className="btn btn-outline text-sm flex items-center gap-1.5"
              style={{ borderColor: "color-mix(in oklch, var(--gold-premium) 30%, transparent)", color: "var(--gold-premium)" }}
              title="Enregistrer les logos par défaut en base de données"
            >
              {seeding ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Synchroniser en base
            </button>
          )}
          <Link href="/admin/client-logos/new" className="btn btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={14} /> Nouveau logo
          </Link>
        </div>
      </div>

      {/* Contrôle taille globale */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: "color-mix(in oklch, var(--foreground) 4%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">Taille des logos</p>
          <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            Ajuste la hauteur de tous les logos dans le carrousel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { const v = Math.max(16, logoHeight - 4); setLogoHeight(v); saveSize(v); }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Réduire">
            <ZoomOut size={16} />
          </button>
          <div className="flex flex-col items-center gap-1">
            <input type="range" min={16} max={80} step={4} value={logoHeight}
              onChange={e => setLogoHeight(Number(e.target.value))}
              onMouseUp={e => saveSize(Number((e.target as HTMLInputElement).value))}
              onTouchEnd={e => saveSize(Number((e.target as HTMLInputElement).value))}
              className="w-32 accent-[var(--royal-blue)] cursor-pointer" />
            <span className="text-xs font-mono font-semibold" style={{ color: "var(--royal-blue)" }}>
              {logoHeight}px
            </span>
          </div>
          <button onClick={() => { const v = Math.min(80, logoHeight + 4); setLogoHeight(v); saveSize(v); }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Agrandir">
            <ZoomIn size={16} />
          </button>
          {/* Aperçu en temps réel */}
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-4 border-l"
            style={{ borderColor: "color-mix(in oklch, var(--foreground) 10%, transparent)", minWidth: 80 }}>
            <div className="w-1 rounded-full" style={{ height: logoHeight, background: "var(--royal-blue)", transition: "height 0.2s" }} />
            <span className="text-xs opacity-50">aperçu</span>
          </div>
          {sizeSaved && (
            <span className="text-xs flex items-center gap-1" style={{ color: "#22C55E" }}>
              <CheckCircle2 size={12} /> Sauvegardé
            </span>
          )}
        </div>
      </div>

      {/* Bannière fallback */}
      {isFallback && (
        <div className="rounded-xl p-4 flex items-start gap-3 text-sm"
          style={{
            background: "color-mix(in oklch, var(--gold-premium) 8%, var(--background))",
            border: "1px solid color-mix(in oklch, var(--gold-premium) 25%, transparent)",
          }}>
          <AlertTriangle size={16} style={{ color: "var(--gold-premium)" }} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold" style={{ color: "var(--gold-premium)" }}>Logos par défaut affichés</p>
            <p className="text-xs mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
              La base de données est vide. Cliquez <strong>Synchroniser en base</strong> pour enregistrer ces logos
              et les gérer depuis ici, ou ajoutez directement vos vrais logos clients.
            </p>
          </div>
        </div>
      )}

      {seedMsg && (
        <div className="rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm"
          style={{
            background: "color-mix(in oklch, #22C55E 10%, transparent)",
            border: "1px solid color-mix(in oklch, #22C55E 20%, transparent)",
            color: "#22C55E",
          }}>
          <CheckCircle2 size={14} /> {seedMsg}
        </div>
      )}

      {/* Filtres + vue */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un logo…"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--royal-blue)]"
          style={{
            background: "color-mix(in oklch, var(--foreground) 4%, transparent)",
            border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)",
          }}
        />
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {error && (
        <div className="p-4 rounded-lg" style={{ background: "color-mix(in oklch, #EF4444 10%, transparent)", color: "#EF4444", border: "1px solid color-mix(in oklch, #EF4444 20%, transparent)" }}>
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="glass glass-strong rounded-xl p-12 text-center">
          <p className="mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
            Aucun logo trouvé
          </p>
          <Link href="/admin/client-logos/new" className="btn btn-primary">Ajouter un logo</Link>
        </div>
      ) : viewMode === "list" ? (
        /* ── VUE LISTE ─────────────────────────────────────────────────────── */
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "color-mix(in oklch, var(--foreground) 4%, transparent)", borderBottom: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
                <th className="text-left px-4 py-3 font-semibold text-xs">Logo</th>
                <th className="text-left px-4 py-3 font-semibold text-xs">Nom</th>
                <th className="hidden sm:table-cell text-left px-4 py-3 font-semibold text-xs">Site web</th>
                <th className="text-center px-4 py-3 font-semibold text-xs">Statut</th>
                <th className="text-right px-4 py-3 font-semibold text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((logo, i) => (
                <tr key={logo.id}
                  style={{ borderTop: i > 0 ? "1px solid color-mix(in oklch, var(--foreground) 5%, transparent)" : "none" }}
                  className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-16 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                      {logoUrl(logo) ? (
                        <img src={logoUrl(logo)} alt={logo.name} className="max-h-8 max-w-14 object-contain" />
                      ) : (
                        <ImageOff size={14} style={{ color: "color-mix(in oklch, var(--foreground) 30%, transparent)" }} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{logo.name}</td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    {logoWebsite(logo) ? (
                      <a href={logoWebsite(logo)} target="_blank" rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 hover:underline"
                        style={{ color: "var(--royal-blue)" }}>
                        {logoWebsite(logo).replace(/^https?:\/\//, "")}
                        <ExternalLink size={10} />
                      </a>
                    ) : <span className="text-xs opacity-40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggleActive(logo.id, logo.active)}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: logo.active ? "color-mix(in oklch, #22C55E 15%, transparent)" : "color-mix(in oklch, var(--foreground) 8%, transparent)",
                        color: logo.active ? "#22C55E" : "color-mix(in oklch, var(--foreground) 45%, transparent)",
                      }}>
                      {logo.active ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/client-logos/${logo.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ color: "var(--royal-blue)" }} title="Modifier">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(logo.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
                        title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── VUE CARTES ────────────────────────────────────────────────────── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((logo) => (
            <div key={logo.id}
              className="rounded-2xl p-4 flex flex-col items-center text-center transition-all"
              style={{
                background: "color-mix(in oklch, var(--background) 80%, transparent)",
                border: `1px solid color-mix(in oklch, var(--foreground) ${logo.active ? "10%" : "6%"}, transparent)`,
                opacity: logo.active ? 1 : 0.6,
              }}>
              {/* Logo preview */}
              <div className="w-full h-16 rounded-xl flex items-center justify-center mb-3 overflow-hidden"
                style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                {logoUrl(logo) ? (
                  <img src={logoUrl(logo)} alt={logo.name} className="max-h-12 max-w-full object-contain px-2" />
                ) : (
                  <ImageOff size={20} style={{ color: "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
                )}
              </div>

              <p className="font-semibold text-sm mb-1 line-clamp-2">{logo.name}</p>

              {logoWebsite(logo) && (
                <a href={logoWebsite(logo)} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] flex items-center gap-0.5 mb-2 hover:underline"
                  style={{ color: "color-mix(in oklch, var(--royal-blue) 70%, transparent)" }}>
                  {logoWebsite(logo).replace(/^https?:\/\//, "").slice(0, 20)}
                  <ExternalLink size={8} />
                </a>
              )}

              {/* Statut */}
              <button onClick={() => handleToggleActive(logo.id, logo.active)}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium mb-3 flex items-center gap-1"
                style={{
                  background: logo.active ? "color-mix(in oklch, #22C55E 12%, transparent)" : "color-mix(in oklch, var(--foreground) 8%, transparent)",
                  color: logo.active ? "#22C55E" : "color-mix(in oklch, var(--foreground) 45%, transparent)",
                }}>
                {logo.active ? <Eye size={9} /> : <EyeOff size={9} />}
                {logo.active ? "Visible" : "Masqué"}
              </button>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full mt-auto pt-3 border-t"
                style={{ borderColor: "color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
                <Link href={`/admin/client-logos/${logo.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)",
                    color: "var(--royal-blue)",
                  }}>
                  <Pencil size={11} /> Modifier
                </Link>
                <button onClick={() => handleDelete(logo.id)}
                  className="p-1.5 rounded-lg text-red-400 transition-colors hover:bg-red-500/10"
                  title="Supprimer">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
