"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList, ListChecks, Globe, ArrowRight, Pin, Check,
  MapPin, Home, Car, Sparkles, Eye, EyeOff, Loader2, FlaskConical, CheckCircle2, AlertTriangle,
} from "lucide-react";

interface AfriModules {
  residences: boolean;
  excursions: boolean;
  transport: boolean;
  bons_plans: boolean;
}

const MODULE_DEFS = [
  {
    key: "demandes" as const,
    href: "/admin/afrinomade/demandes",
    icon: ClipboardList,
    title: "Demandes & Cotations",
    desc: "Gérez les demandes de voyage reçues, changez les statuts, générez et envoyez des cotations.",
    color: "var(--turquoise)",
    toggleable: false,
  },
  {
    key: "catalogue" as const,
    href: "/admin/afrinomade/catalogue",
    icon: ListChecks,
    title: "Catalogue des prix",
    desc: "Modifiez les prix de l'hébergement, transport, guide, activités. Basse/haute saison.",
    color: "var(--gold-premium)",
    toggleable: false,
  },
  {
    key: "excursions" as const,
    href: "/admin/afrinomade/excursions",
    icon: MapPin,
    title: "Excursions",
    desc: "Ajoutez, modifiez et supprimez les excursions visibles sur /afrinomade/excursions.",
    color: "var(--turquoise)",
    toggleable: true,
  },
  {
    key: "residences" as const,
    href: "/admin/afrinomade/residences",
    icon: Home,
    title: "Résidences",
    desc: "Gérez les résidences et maisons d'hôtes visibles sur /afrinomade/residences.",
    color: "var(--gold-premium)",
    toggleable: true,
  },
  {
    key: "transport" as const,
    href: "/admin/afrinomade/transport",
    icon: Car,
    title: "Transport & Voyages",
    desc: "Modifiez les formules de transport visibles sur /afrinomade/transport.",
    color: "var(--turquoise)",
    toggleable: true,
  },
  {
    key: "bons_plans" as const,
    href: "/admin/afrinomade/bons-plans",
    icon: Sparkles,
    title: "Bons Plans & Lieux",
    desc: "Gérez le guide des adresses et lieux branchés visibles sur /afrinomade/bons-plans.",
    color: "var(--gold-premium)",
    toggleable: true,
  },
];

const NOTES = [
  "Les demandes arrivent automatiquement depuis le formulaire du site",
  "Chaque nouvelle demande déclenche un email de confirmation client + une notification admin",
  "La cotation est générée automatiquement à partir du catalogue — chaque ligne est modifiable",
  "Les modifications sur Excursions, Résidences, Transport et Bons Plans sont visibles en temps réel",
  "Utilisez le bouton Œil pour masquer un module du site sans le supprimer",
];

export default function AdminAfriNomade() {
  const [modules, setModules] = useState<AfriModules>({
    residences: true, excursions: true, transport: true, bons_plans: true,
  });
  const [saving,      setSaving]      = useState<string | null>(null);
  const [seeding,     setSeeding]     = useState(false);
  const [seedResult,  setSeedResult]  = useState<{ success: number; errors: string[] } | null>(null);

  useEffect(() => {
    fetch("/api/admin/afrinomade/modules")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setModules(d); });
  }, []);

  const toggleModule = async (key: keyof AfriModules) => {
    const newValue = !modules[key];
    setSaving(key);
    try {
      const res = await fetch("/api/admin/afrinomade/modules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });
      if (res.ok) {
        setModules((prev) => ({ ...prev, [key]: newValue }));
      }
    } finally {
      setSaving(null);
    }
  };

  const seedDemandes = async () => {
    if (!confirm("Créer 10 fausses demandes de démonstration ? (à faire une seule fois)")) return;
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/admin/afrinomade/seed", { method: "POST" });
      const data = await res.json();
      setSeedResult({ success: data.success ?? 0, errors: data.errors ?? [] });
    } catch {
      setSeedResult({ success: 0, errors: ["Erreur réseau"] });
    } finally {
      setSeeding(false);
    }
  };

  const isVisible = (key: string): boolean => {
    if (key === "bons_plans") return modules.bons_plans;
    return modules[key as keyof AfriModules] ?? true;
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Globe size={28} style={{ color: "var(--turquoise)" }} strokeWidth={1.8} />
          <h1 className="text-2xl sm:text-3xl font-bold">AfriNomade</h1>
        </div>
        <p className="mt-1 text-sm pl-10" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
          Gestion métier de la branche Tourisme & Loisirs
        </p>
      </div>

      {/* Modules grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULE_DEFS.map((m) => {
          const Icon = m.icon;
          const visible = isVisible(m.key);
          const isSaving = saving === m.key;
          const toggleKey = m.key as keyof AfriModules;

          return (
            <div key={m.href}
              className="rounded-2xl p-5 transition-all duration-200 relative"
              style={{
                background: "color-mix(in oklch, var(--background) 80%, transparent)",
                border: `1px solid color-mix(in oklch, ${m.color} ${visible ? "20%" : "10%"}, transparent)`,
                opacity: m.toggleable && !visible ? 0.6 : 1,
              }}>
              {/* Toggle visibility button */}
              {m.toggleable && (
                <button
                  onClick={() => toggleModule(toggleKey)}
                  disabled={!!saving}
                  title={visible ? "Masquer du site" : "Afficher sur le site"}
                  className="absolute top-4 right-4 p-1.5 rounded-lg transition-all hover:scale-110 disabled:opacity-50"
                  style={{
                    background: visible
                      ? "color-mix(in oklch, var(--turquoise) 12%, transparent)"
                      : "color-mix(in oklch, var(--foreground) 8%, transparent)",
                    color: visible ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 40%, transparent)",
                    border: `1px solid ${visible ? "color-mix(in oklch, var(--turquoise) 20%, transparent)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                  }}
                >
                  {isSaving
                    ? <Loader2 size={14} className="animate-spin" />
                    : visible
                      ? <Eye size={14} strokeWidth={2} />
                      : <EyeOff size={14} strokeWidth={2} />}
                </button>
              )}

              <Link href={m.href} className="group block">
                <div className="flex items-center gap-3 mb-3 pr-8">
                  <Icon size={22} style={{ color: m.color }} strokeWidth={1.8} />
                  <h2 className="text-base font-bold">{m.title}</h2>
                </div>
                <p className="text-sm mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                  {m.desc}
                </p>
                <div className="text-xs font-semibold flex items-center gap-1 transition-all group-hover:gap-2"
                  style={{ color: m.color }}>
                  Accéder <ArrowRight size={13} />
                </div>
              </Link>

              {/* Visibility status chip */}
              {m.toggleable && (
                <div className="mt-3 pt-3 border-t flex items-center gap-1.5 text-xs"
                  style={{ borderColor: "color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: visible ? "#22C55E" : "#EF4444" }} />
                  <span style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                    {visible ? "Visible sur le site" : "Masqué du site"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Zone Données de test */}
      <div className="rounded-xl p-5"
        style={{
          background: "color-mix(in oklch, var(--gold-premium) 4%, var(--background))",
          border: "1px solid color-mix(in oklch, var(--gold-premium) 15%, transparent)",
        }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-semibold text-sm mb-1">
              <FlaskConical size={15} style={{ color: "var(--gold-premium)" }} strokeWidth={2} />
              <span>Données de démonstration</span>
            </div>
            <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
              Insère 10 fausses demandes réalistes pour tester le workflow complet (différents statuts, destinations, cotations).
            </p>
          </div>
          <button
            onClick={seedDemandes}
            disabled={seeding}
            className="btn btn-outline shrink-0 flex items-center gap-2 text-sm"
            style={{ borderColor: "color-mix(in oklch, var(--gold-premium) 30%, transparent)", color: "var(--gold-premium)" }}
          >
            {seeding ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
            {seeding ? "Création…" : "Créer des demandes test"}
          </button>
        </div>

        {seedResult && (
          <div className="mt-3 flex items-start gap-2 text-xs rounded-lg px-3 py-2"
            style={{
              background: seedResult.errors.length === 0
                ? "color-mix(in oklch, #22C55E 10%, transparent)"
                : "color-mix(in oklch, #EF4444 10%, transparent)",
              border: `1px solid ${seedResult.errors.length === 0 ? "color-mix(in oklch, #22C55E 20%, transparent)" : "color-mix(in oklch, #EF4444 20%, transparent)"}`,
              color: seedResult.errors.length === 0 ? "#22C55E" : "#EF4444",
            }}>
            {seedResult.errors.length === 0
              ? <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
              : <AlertTriangle size={13} className="mt-0.5 shrink-0" />}
            <span>
              {seedResult.success} demande{seedResult.success > 1 ? "s" : ""} créée{seedResult.success > 1 ? "s" : ""}
              {seedResult.errors.length > 0 && ` · ${seedResult.errors.length} erreur(s) : ${seedResult.errors.join(", ")}`}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-xl p-5 text-sm"
        style={{
          background: "color-mix(in oklch, var(--turquoise) 5%, var(--background))",
          border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)",
        }}>
        <div className="flex items-center gap-2 font-semibold mb-3">
          <Pin size={15} style={{ color: "var(--turquoise)" }} strokeWidth={2} />
          <span>Notes rapides</span>
        </div>
        <ul className="space-y-2">
          {NOTES.map((note, i) => (
            <li key={i} className="flex items-start gap-2 text-xs"
              style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
              <Check size={13} className="mt-0.5 shrink-0" style={{ color: "var(--turquoise)" }} strokeWidth={2.5} />
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
