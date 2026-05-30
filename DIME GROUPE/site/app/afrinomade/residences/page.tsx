"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Wifi, Utensils, Coffee, Snowflake, Car, Waves, Sunset,
  ChefHat, Lock, Star, MapPin, BedDouble, Bath, Maximize2, Users,
  X, ChevronLeft, ChevronRight, Check, Home,
} from "lucide-react";
import ScrollAnimation from "../../components/ScrollAnimation";
import { useWhatsApp } from "../../components/WhatsAppNumber";
import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Residence {
  id: string; slug: string; title: string; img: string;
  location: string; pays: string | null; capacity: string; price: string;
  type: string; amenities: string[]; description: string; badge: string | null;
  nb_chambres: number | null; nb_salles_de_bain: number | null; surface_m2: number | null;
}

// ─── Données statiques ────────────────────────────────────────────────────────
const PAYS_LIST = [
  { key: "Côte d'Ivoire", label: "Côte d'Ivoire", flag: "🇨🇮" },
  { key: "Sénégal",       label: "Sénégal",        flag: "🇸🇳" },
  { key: "Ghana",         label: "Ghana",           flag: "🇬🇭" },
  { key: "Maroc",         label: "Maroc",           flag: "🇲🇦" },
  { key: "Bénin",         label: "Bénin",           flag: "🇧🇯" },
  { key: "Togo",          label: "Togo",            flag: "🇹🇬" },
];

const PAYS_CARD_LIST = [
  { key: "CI",      label: "Côte d'Ivoire", flag: "🇨🇮" },
  { key: "Sénégal", label: "Sénégal",       flag: "🇸🇳" },
  { key: "Ghana",   label: "Ghana",         flag: "🇬🇭" },
  { key: "Maroc",   label: "Maroc",         flag: "🇲🇦" },
  { key: "Bénin",   label: "Bénin",         flag: "🇧🇯" },
  { key: "Togo",    label: "Togo",          flag: "🇹🇬" },
];

const TYPES_LOGEMENT = ["Appartement", "Villa", "Chambre d'hôtes", "Studio", "Maison"];
const AMENITIES_FORM = [
  "Wi-Fi", "Clim", "Piscine", "Parking", "Cuisine équipée",
  "Kitchenette", "Petit-déjeuner inclus", "Plage privée",
  "Chef sur demande", "Sécurité 24h", "Hammam", "Climatisation centralisée",
];
const BUDGETS = [
  "Moins de 30 000 FCFA / nuit",
  "30 000 – 60 000 FCFA / nuit",
  "60 000 – 100 000 FCFA / nuit",
  "100 000 – 200 000 FCFA / nuit",
  "Plus de 200 000 FCFA / nuit",
  "Pas de limite",
];

const AMENITY_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  "Wi-Fi": Wifi, "Cuisine équipée": Utensils, "Kitchenette": Coffee,
  "Clim": Snowflake, "Parking": Car, "Piscine": Waves,
  "Plage privée": Sunset, "Chef sur demande": ChefHat, "Sécurité 24h": Lock,
  "Petit-déjeuner inclus": Coffee,
};

const BADGE_COLORS: Record<string, string> = {
  "Premium":     "linear-gradient(135deg, #b8860b, #d4a017)",
  "Coup de cœur":"linear-gradient(135deg, #c0392b, #e74c3c)",
  "Exclusif":    "linear-gradient(135deg, #1a1a2e, #16213e)",
  "Nouveauté":   "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, #0f3460))",
  "Vue mer":     "linear-gradient(135deg, #006994, #0099cc)",
};

function getPaysInfo(pays: string | null) {
  if (!pays) return null;
  return PAYS_CARD_LIST.find(p => p.key === pays) ?? null;
}

// ─── Formulaire de demande ────────────────────────────────────────────────────
interface FormData {
  pays_destination: string;
  date_depart: string;
  date_retour: string;
  nb_adultes: number;
  nb_enfants: number;
  type_hebergement: string;
  nb_chambres: number;
  budget: string;
  equipements: string[];
  preference_localisation: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  besoins_particuliers: string;
}

const EMPTY_FORM: FormData = {
  pays_destination: "", date_depart: "", date_retour: "",
  nb_adultes: 2, nb_enfants: 0,
  type_hebergement: "", nb_chambres: 1, budget: "", equipements: [],
  preference_localisation: "",
  prenom: "", nom: "", email: "", telephone: "", besoins_particuliers: "",
};

// ── Modal formulaire ──────────────────────────────────────────────────────────
function ResidenceRequestModal({ onClose, whatsapp }: { onClose: () => void; whatsapp: string }) {
  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [errors, setErrors]       = useState<Partial<Record<keyof FormData | "global", string>>>({});
  const [lastForm, setLastForm]   = useState<FormData>(EMPTY_FORM);

  const set = useCallback((field: keyof FormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const toggleEquip = (eq: string) => {
    set("equipements", form.equipements.includes(eq)
      ? form.equipements.filter(e => e !== eq)
      : [...form.equipements, eq]);
  };

  const validateStep = (s: number): boolean => {
    const errs: typeof errors = {};
    if (s === 1) {
      if (!form.pays_destination) errs.pays_destination = "Choisissez une destination";
      if (!form.date_depart)      errs.date_depart = "Indiquez la date d'arrivée";
      if (!form.date_retour)      errs.date_retour = "Indiquez la date de départ";
      if (form.date_depart && form.date_retour && form.date_retour <= form.date_depart)
        errs.date_retour = "La date de départ doit être après l'arrivée";
    }
    if (s === 3) {
      if (!form.prenom)   errs.prenom = "Requis";
      if (!form.nom)      errs.nom = "Requis";
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email invalide";
      if (!form.telephone) errs.telephone = "Requis";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const submit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/afrinomade/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type_service: "residence",
          preference_localisation: form.preference_localisation ? [form.preference_localisation] : [],
          source: "site",
        }),
      });
      if (res.ok) {
        setLastForm(form);
        setSuccess(true);
      } else {
        setErrors({ global: "Une erreur est survenue. Veuillez réessayer." });
      }
    } catch {
      setErrors({ global: "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setSubmitting(false);
    }
  };

  // Fermeture sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const STEP_LABELS = ["Séjour", "Logement", "Contact"];

  const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all";
  const inputStyle = {
    background: "color-mix(in oklch, var(--background) 85%, transparent)",
    border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)",
  };
  const focusStyle = { "--tw-ring-color": "var(--turquoise)" } as React.CSSProperties;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh", background: "var(--background)", border: "1px solid color-mix(in oklch, var(--gold-premium) 15%, transparent)" }}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 7%, transparent)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--gold-premium), color-mix(in oklch, var(--gold-premium) 70%, var(--turquoise)))" }}>
              <Home size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Demande personnalisée</h2>
              <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                Trouvons la résidence idéale pour vous
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Indicateur de progression ─────────────────────────────────────── */}
        {!success && (
          <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-1.5 ${n <= step ? "" : "opacity-40"}`}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                      style={{
                        background: done ? "var(--turquoise)" : active ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 10%, transparent)",
                        color: (done || active) ? "white" : "color-mix(in oklch, var(--foreground) 50%, transparent)",
                      }}>
                      {done ? <Check size={11} /> : n}
                    </div>
                    <span className="text-xs font-medium hidden sm:block"
                      style={{ color: active ? "var(--gold-premium)" : done ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className="flex-1 h-px mx-1"
                      style={{ background: n < step ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 10%, transparent)" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Contenu ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">

          {/* ─ Succès ─ */}
          {success ? (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-5">
              {/* Icône succès */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 60%, var(--gold-premium)))" }}>
                <Check size={32} className="text-white" strokeWidth={2.5} />
              </div>

              <div>
                <h3 className="font-bold text-xl mb-2">Demande envoyée ✅</h3>
                <p className="text-sm max-w-xs" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                  Votre demande de résidence a bien été reçue. Notre équipe vous contacte sous <strong style={{ color: "var(--turquoise)" }}>24h</strong>.
                </p>
              </div>

              {/* Récap compact */}
              <div className="w-full rounded-xl px-4 py-3 text-xs text-left space-y-1"
                style={{ background: "color-mix(in oklch, var(--gold-premium) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--gold-premium) 15%, transparent)" }}>
                {lastForm.pays_destination && <p>📍 {lastForm.pays_destination}</p>}
                {lastForm.date_depart && <p>📅 {lastForm.date_depart} → {lastForm.date_retour}</p>}
                {lastForm.type_hebergement && <p>🏠 {lastForm.type_hebergement} · {lastForm.nb_chambres} ch.</p>}
                {lastForm.budget && <p>💰 {lastForm.budget}</p>}
              </div>

              {/* CTA WhatsApp */}
              <div className="w-full space-y-2.5">
                <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                  Besoin d&apos;une réponse immédiate ?
                </p>
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                    `Bonjour AfriNomade 👋 Je viens de soumettre une demande de résidence :\n` +
                    `📍 ${lastForm.pays_destination || '—'}\n` +
                    `📅 ${lastForm.date_depart || '—'} → ${lastForm.date_retour || '—'}\n` +
                    `👥 ${lastForm.nb_adultes} adulte(s)${lastForm.nb_enfants > 0 ? ` + ${lastForm.nb_enfants} enfant(s)` : ''}\n` +
                    `🏠 ${lastForm.type_hebergement || 'Non précisé'} · ${lastForm.nb_chambres} ch.\n` +
                    `💰 ${lastForm.budget || 'Non précisé'}\n` +
                    `\nPrénom : ${lastForm.prenom} ${lastForm.nom}\n` +
                    `Tél : ${lastForm.telephone}`
                  )}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full rounded-full py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                  style={{ background: "#25D366" }}>
                  {/* WhatsApp icon */}
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Confirmer via WhatsApp
                </a>
                <button onClick={onClose}
                  className="w-full rounded-full py-2.5 text-sm font-medium transition-all hover:bg-white/5"
                  style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)", color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                  Fermer
                </button>
              </div>
            </div>

          ) : step === 1 ? (
            /* ─ ÉTAPE 1 : Destination & Séjour ─ */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--turquoise)" }}>
                  Destination *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYS_LIST.map(p => (
                    <button key={p.key} type="button"
                      onClick={() => set("pays_destination", p.key)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left"
                      style={{
                        background: form.pays_destination === p.key
                          ? "color-mix(in oklch, var(--gold-premium) 15%, transparent)"
                          : "color-mix(in oklch, var(--foreground) 3%, transparent)",
                        border: `1.5px solid ${form.pays_destination === p.key ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                        color: form.pays_destination === p.key ? "var(--gold-premium)" : undefined,
                      }}>
                      <span className="text-lg leading-none">{p.flag}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
                {errors.pays_destination && <p className="text-xs text-red-400 mt-1">{errors.pays_destination}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>
                    Arrivée *
                  </label>
                  <input type="date" value={form.date_depart}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => set("date_depart", e.target.value)}
                    className={inputCls} style={{ ...inputStyle, ...focusStyle }}
                  />
                  {errors.date_depart && <p className="text-xs text-red-400 mt-1">{errors.date_depart}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>
                    Départ *
                  </label>
                  <input type="date" value={form.date_retour}
                    min={form.date_depart || new Date().toISOString().slice(0, 10)}
                    onChange={e => set("date_retour", e.target.value)}
                    className={inputCls} style={{ ...inputStyle, ...focusStyle }}
                  />
                  {errors.date_retour && <p className="text-xs text-red-400 mt-1">{errors.date_retour}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>
                    Adultes
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => set("nb_adultes", Math.max(1, form.nb_adultes - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-all hover:bg-white/5"
                      style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{form.nb_adultes}</span>
                    <button type="button" onClick={() => set("nb_adultes", form.nb_adultes + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-all hover:bg-white/5"
                      style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>
                    Enfants
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => set("nb_enfants", Math.max(0, form.nb_enfants - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-all hover:bg-white/5"
                      style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{form.nb_enfants}</span>
                    <button type="button" onClick={() => set("nb_enfants", form.nb_enfants + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-all hover:bg-white/5"
                      style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

          ) : step === 2 ? (
            /* ─ ÉTAPE 2 : Logement souhaité ─ */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--turquoise)" }}>
                  Type de logement préféré
                </label>
                <div className="flex flex-wrap gap-2">
                  {TYPES_LOGEMENT.map(t => (
                    <button key={t} type="button"
                      onClick={() => set("type_hebergement", form.type_hebergement === t ? "" : t)}
                      className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
                      style={{
                        background: form.type_hebergement === t ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                        border: `1px solid ${form.type_hebergement === t ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 12%, transparent)"}`,
                        color: form.type_hebergement === t ? "white" : undefined,
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>
                    Chambres minimum
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => set("nb_chambres", Math.max(1, form.nb_chambres - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-all hover:bg-white/5"
                      style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{form.nb_chambres}</span>
                    <button type="button" onClick={() => set("nb_chambres", form.nb_chambres + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-all hover:bg-white/5"
                      style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>
                    Budget / nuit
                  </label>
                  <select value={form.budget} onChange={e => set("budget", e.target.value)}
                    className={inputCls + " text-xs"} style={{ ...inputStyle, ...focusStyle }}>
                    <option value="">Sélectionner…</option>
                    {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--turquoise)" }}>
                  Équipements souhaités
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AMENITIES_FORM.map(eq => {
                    const active = form.equipements.includes(eq);
                    return (
                      <button key={eq} type="button" onClick={() => toggleEquip(eq)}
                        className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
                        style={{
                          background: active ? "color-mix(in oklch, var(--turquoise) 15%, transparent)" : "color-mix(in oklch, var(--foreground) 3%, transparent)",
                          border: `1px solid ${active ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                          color: active ? "var(--turquoise)" : undefined,
                        }}>
                        {active ? "✓ " : ""}{eq}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>
                  Quartier / localisation souhaitée
                </label>
                <input value={form.preference_localisation}
                  onChange={e => set("preference_localisation", e.target.value)}
                  placeholder="Ex : Cocody, bord de mer, centre-ville…"
                  className={inputCls} style={{ ...inputStyle, ...focusStyle }}
                />
              </div>
            </div>

          ) : (
            /* ─ ÉTAPE 3 : Contact ─ */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>Prénom *</label>
                  <input value={form.prenom} onChange={e => set("prenom", e.target.value)}
                    placeholder="Kouadio" className={inputCls} style={{ ...inputStyle, ...focusStyle }} />
                  {errors.prenom && <p className="text-xs text-red-400 mt-1">{errors.prenom}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>Nom *</label>
                  <input value={form.nom} onChange={e => set("nom", e.target.value)}
                    placeholder="Diallo" className={inputCls} style={{ ...inputStyle, ...focusStyle }} />
                  {errors.nom && <p className="text-xs text-red-400 mt-1">{errors.nom}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>Email *</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="vous@exemple.com" className={inputCls} style={{ ...inputStyle, ...focusStyle }} />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>Téléphone *</label>
                <input type="tel" value={form.telephone} onChange={e => set("telephone", e.target.value)}
                  placeholder="+225 07 00 00 00 00" className={inputCls} style={{ ...inputStyle, ...focusStyle }} />
                {errors.telephone && <p className="text-xs text-red-400 mt-1">{errors.telephone}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--turquoise)" }}>
                  Besoins particuliers <span style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>(optionnel)</span>
                </label>
                <textarea value={form.besoins_particuliers}
                  onChange={e => set("besoins_particuliers", e.target.value)}
                  rows={3} placeholder="Accessibilité, proximité d'une école, vue mer, parking…"
                  className={inputCls + " resize-none"} style={{ ...inputStyle, ...focusStyle }} />
              </div>

              {/* Récap */}
              <div className="rounded-xl p-4 space-y-2 text-xs"
                style={{ background: "color-mix(in oklch, var(--gold-premium) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--gold-premium) 18%, transparent)" }}>
                <p className="font-semibold text-[11px] uppercase tracking-wider" style={{ color: "var(--gold-premium)" }}>
                  Récapitulatif de votre demande
                </p>
                {form.pays_destination && <p>📍 {form.pays_destination}</p>}
                {form.date_depart && <p>📅 {form.date_depart} → {form.date_retour}</p>}
                <p>👥 {form.nb_adultes} adulte{form.nb_adultes > 1 ? "s" : ""}{form.nb_enfants > 0 ? ` + ${form.nb_enfants} enfant${form.nb_enfants > 1 ? "s" : ""}` : ""}</p>
                {form.type_hebergement && <p>🏠 {form.type_hebergement} · {form.nb_chambres} ch.</p>}
                {form.budget && <p>💰 {form.budget}</p>}
                {form.equipements.length > 0 && <p>✓ {form.equipements.slice(0, 3).join(", ")}{form.equipements.length > 3 ? ` +${form.equipements.length - 3}` : ""}</p>}
              </div>

              {errors.global && (
                <p className="text-xs text-red-400 text-center">{errors.global}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Boutons navigation ────────────────────────────────────────────── */}
        {!success && (
          <div className="flex items-center justify-between gap-3 px-6 pb-6 pt-3 flex-shrink-0"
            style={{ borderTop: "1px solid color-mix(in oklch, var(--foreground) 7%, transparent)" }}>
            <button onClick={step === 1 ? onClose : prev}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all hover:bg-white/5"
              style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
              <ChevronLeft size={15} />
              {step === 1 ? "Annuler" : "Retour"}
            </button>

            {step < 3 ? (
              <button onClick={next}
                className="flex items-center gap-1.5 rounded-full px-6 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 65%, var(--gold-premium)))" }}>
                Suivant
                <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting}
                className="flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-60 disabled:scale-100"
                style={{ background: "linear-gradient(135deg, var(--gold-premium), color-mix(in oklch, var(--gold-premium) 70%, var(--turquoise)))" }}>
                {submitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : <Check size={14} />}
                {submitting ? "Envoi…" : "Envoyer ma demande"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AfriResidences() {
  const whatsapp = useWhatsApp("afri");
  const [residences, setResidences] = useState<Residence[]>([]);
  const [activeType, setActiveType] = useState("Tous");
  const [activePays, setActivePays] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/afrinomade/residences")
      .then(r => r.json())
      .then(data => { setResidences(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Bloquer le scroll quand le modal est ouvert
  useEffect(() => {
    if (showForm) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showForm]);

  const types = ["Tous", ...Array.from(new Set(residences.map(r => r.type).filter(Boolean)))];
  const paysPresents = PAYS_CARD_LIST.filter(p => residences.some(r => r.pays === p.key));
  const nbPays = paysPresents.length;

  const filtered = residences.filter(r => {
    const typeOk = activeType === "Tous" || r.type === activeType;
    const paysOk = activePays === "Tous" || r.pays === activePays;
    return typeOk && paysOk;
  });

  const featured = filtered.filter(r => r.badge === "Premium" || r.badge === "Coup de cœur" || r.badge === "Exclusif");
  const regular  = filtered.filter(r => !featured.includes(r));

  const waMsg = (res: Residence) =>
    `Bonjour AfriNomade ! Je souhaite réserver "${res.title}" (${res.location}${res.pays ? `, ${res.pays}` : ""}). Pouvez-vous me confirmer la disponibilité et les conditions ?`;

  return (
    <>
      {showForm && <ResidenceRequestModal onClose={() => setShowForm(false)} whatsapp={whatsapp} />}

      <main className="container py-16">

        {/* ── Hero header ────────────────────────────────────────────────────── */}
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex-1">
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--turquoise)" }}>AfriNomade · Hébergements</span>
              <h1 className="mt-2 text-3xl md:text-5xl font-bold leading-tight">
                Résidences &amp;<br className="hidden md:block" /> Maisons d&apos;hôtes
              </h1>
              <p className="mt-3 text-sm max-w-md leading-relaxed" style={{ color: "color-mix(in oklch, var(--foreground) 62%, transparent)" }}>
                Un réseau d&apos;adresses soigneusement sélectionnées pour leur confort, leur caractère et leur rapport qualité/prix.
              </p>
              {!loading && residences.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {[
                    { value: residences.length, label: "résidences" },
                    { value: nbPays, label: "pays" },
                    { value: residences.filter(r => r.badge).length || undefined, label: "sélections premium" },
                  ].filter(s => s.value).map(stat => (
                    <div key={stat.label} className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold" style={{ color: "var(--gold-premium)" }}>{stat.value}</span>
                      <span className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                style={{ background: "color-mix(in oklch, var(--gold-premium) 12%, transparent)", color: "var(--gold-premium)", border: "1.5px solid var(--gold-premium)" }}>
                <Home size={15} />
                Demande personnalisée
              </button>
              <Link href="/afrinomade/reservation?service=residence"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 65%, var(--gold-premium)))" }}>
                Vérifier la disponibilité
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        {/* ── Filtre pays ──────────────────────────────────────────────────────── */}
        {!loading && paysPresents.length > 1 && (
          <ScrollAnimation animation="fadeInUp" delay={60}>
            <div className="overflow-x-auto pb-1 mb-3 -mx-1 px-1">
              <div className="flex gap-2 w-max md:w-auto md:flex-wrap">
                <button onClick={() => setActivePays("Tous")}
                  className="rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5"
                  style={{
                    background: activePays === "Tous" ? "var(--turquoise)" : "color-mix(in oklch, var(--turquoise) 9%, transparent)",
                    color: activePays === "Tous" ? "white" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                    border: `1px solid ${activePays === "Tous" ? "var(--turquoise)" : "color-mix(in oklch, var(--turquoise) 22%, transparent)"}`,
                  }}>
                  🌍 Tous les pays
                </button>
                {paysPresents.map(p => {
                  const count = residences.filter(r => r.pays === p.key).length;
                  const isActive = activePays === p.key;
                  return (
                    <button key={p.key} onClick={() => setActivePays(p.key)}
                      className="rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5"
                      style={{
                        background: isActive ? "var(--turquoise)" : "color-mix(in oklch, var(--turquoise) 9%, transparent)",
                        color: isActive ? "white" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                        border: `1px solid ${isActive ? "var(--turquoise)" : "color-mix(in oklch, var(--turquoise) 22%, transparent)"}`,
                      }}>
                      <span className="text-sm leading-none">{p.flag}</span>
                      {p.label}
                      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none"
                        style={{
                          background: isActive ? "rgba(255,255,255,0.22)" : "color-mix(in oklch, var(--turquoise) 18%, transparent)",
                          color: isActive ? "white" : "var(--turquoise)",
                        }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollAnimation>
        )}

        {/* ── Filtre type ──────────────────────────────────────────────────────── */}
        <ScrollAnimation animation="fadeInUp" delay={100}>
          <div className="flex flex-wrap gap-1.5 mb-8">
            {types.map(type => (
              <button key={type} onClick={() => setActiveType(type)}
                className="rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200"
                style={{
                  background: activeType === type ? "var(--gold-premium)" : "color-mix(in oklch, var(--gold-premium) 9%, transparent)",
                  color: activeType === type ? "white" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                  border: `1px solid ${activeType === type ? "var(--gold-premium)" : "color-mix(in oklch, var(--gold-premium) 22%, transparent)"}`,
                }}>
                {type}
              </button>
            ))}
            {filtered.length > 0 && (
              <span className="ml-auto text-xs self-center" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>
                {filtered.length} résidence{filtered.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </ScrollAnimation>

        {/* ── Contenu ────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "color-mix(in oklch, var(--turquoise) 30%, transparent)", borderTopColor: "var(--turquoise)" }} />
            <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>Chargement des résidences…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🏠</p>
            <p className="text-sm font-medium mb-1">Aucune résidence pour cette sélection</p>
            <p className="text-xs mb-5" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
              Essayez d&apos;autres critères ou faites une demande personnalisée
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                className="text-xs font-semibold rounded-full px-5 py-2 transition-all hover:scale-105"
                style={{ background: "color-mix(in oklch, var(--turquoise) 12%, transparent)", color: "var(--turquoise)", border: "1px solid color-mix(in oklch, var(--turquoise) 25%, transparent)" }}
                onClick={() => { setActivePays("Tous"); setActiveType("Tous"); }}>
                Réinitialiser les filtres
              </button>
              <button
                className="text-xs font-semibold rounded-full px-5 py-2 transition-all hover:scale-105"
                style={{ background: "color-mix(in oklch, var(--gold-premium) 12%, transparent)", color: "var(--gold-premium)", border: "1px solid color-mix(in oklch, var(--gold-premium) 25%, transparent)" }}
                onClick={() => setShowForm(true)}>
                Faire une demande personnalisée
              </button>
            </div>
          </div>
        ) : (
          <>
            {featured.length > 0 && activeType === "Tous" && activePays === "Tous" && (
              <ScrollAnimation animation="fadeInUp" delay={0}>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={14} fill="currentColor" strokeWidth={0} style={{ color: "var(--gold-premium)" }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold-premium)" }}>
                      Sélection à la une
                    </span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {featured.map((res, i) => (
                      <ResCard key={res.id} res={res} whatsapp={whatsapp} waMsg={waMsg} delay={i * 80} featured />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 border-t" style={{ borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }} />
                  <span className="text-xs uppercase tracking-widest" style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>Toutes les résidences</span>
                  <div className="flex-1 border-t" style={{ borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }} />
                </div>
              </ScrollAnimation>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(featured.length > 0 && activeType === "Tous" && activePays === "Tous" ? regular : filtered).map((res, i) => (
                <ResCard key={res.id} res={res} whatsapp={whatsapp} waMsg={waMsg} delay={i * 60} />
              ))}
            </div>
          </>
        )}

        {/* ── CTA demande personnalisée ─────────────────────────────────────── */}
        {!loading && (
          <ScrollAnimation animation="fadeInUp" delay={150}>
            <div className="mt-12 rounded-2xl p-8 text-center"
              style={{ background: "linear-gradient(135deg, color-mix(in oklch, var(--gold-premium) 8%, var(--background)), color-mix(in oklch, var(--turquoise) 5%, var(--background)))", border: "1px solid color-mix(in oklch, var(--gold-premium) 18%, transparent)" }}>
              <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--gold-premium), color-mix(in oklch, var(--gold-premium) 70%, var(--turquoise)))" }}>
                <Home size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Vous ne trouvez pas votre bonheur ?</h3>
              <p className="text-sm max-w-md mx-auto mb-5" style={{ color: "color-mix(in oklch, var(--foreground) 58%, transparent)" }}>
                Dites-nous exactement ce que vous cherchez. Notre équipe trouve pour vous la résidence parfaite selon vos critères, dates et budget.
              </p>
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                style={{ background: "linear-gradient(135deg, var(--gold-premium), color-mix(in oklch, var(--gold-premium) 65%, var(--turquoise)))" }}>
                <Home size={15} />
                Faire une demande personnalisée
              </button>
            </div>
          </ScrollAnimation>
        )}

        {/* ── Disclaimer ─────────────────────────────────────────────────────── */}
        <ScrollAnimation animation="fadeInUp" delay={200}>
          <div className="mt-6 rounded-2xl p-5 text-sm text-center"
            style={{ background: "color-mix(in oklch, var(--gold-premium) 5%, var(--background))", border: "1px dashed color-mix(in oklch, var(--gold-premium) 22%, transparent)", color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
            🏡 Toutes les adresses sont vérifiées par notre équipe.
            Tarifs indicatifs — prix finaux communiqués à la réservation selon disponibilité et saison.
          </div>
        </ScrollAnimation>
      </main>
    </>
  );
}

// ── Composant carte résidence ─────────────────────────────────────────────────
function ResCard({
  res, whatsapp, waMsg, delay = 0, featured = false,
}: {
  res: Residence;
  whatsapp: string;
  waMsg: (r: Residence) => string;
  delay?: number;
  featured?: boolean;
}) {
  const paysInfo = getPaysInfo(res.pays);
  const badgeBg  = res.badge ? (BADGE_COLORS[res.badge] ?? "linear-gradient(135deg, var(--gold-premium), color-mix(in oklch, var(--gold-premium) 70%, var(--turquoise)))") : null;

  return (
    <ScrollAnimation animation="fadeInUp" delay={delay}>
      <div className={`group rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl`}
        style={{
          background: "color-mix(in oklch, var(--background) 88%, transparent)",
          border: `1px solid ${featured ? "color-mix(in oklch, var(--gold-premium) 28%, transparent)" : "color-mix(in oklch, var(--gold-premium) 14%, transparent)"}`,
        }}>
        <div className={`relative overflow-hidden flex-shrink-0 ${featured ? "h-60" : "h-52"}`}>
          <Image src={res.img} alt={res.title} fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)" }} />
          {paysInfo && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
              style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <span className="text-sm leading-none">{paysInfo.flag}</span>
              {paysInfo.label}
            </div>
          )}
          <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)" }}>
            {res.type}
          </div>
          {badgeBg && res.badge && (
            <div className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1"
              style={{ background: badgeBg }}>
              <Star size={9} fill="currentColor" strokeWidth={0} />
              {res.badge}
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <h3 className="font-bold text-base leading-snug">{res.title}</h3>
            <p className="flex items-center gap-1 mt-1 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 52%, transparent)" }}>
              <MapPin size={11} style={{ color: "var(--turquoise)", flexShrink: 0 }} />
              {res.location}
            </p>
          </div>

          {(res.nb_chambres != null || res.nb_salles_de_bain != null || res.surface_m2 != null) && (
            <div className="flex items-center gap-4 py-2 px-3 rounded-xl text-xs"
              style={{ background: "color-mix(in oklch, var(--turquoise) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 12%, transparent)" }}>
              {res.nb_chambres != null && (
                <span className="flex items-center gap-1.5">
                  <BedDouble size={13} strokeWidth={1.5} style={{ color: "var(--turquoise)" }} />
                  <span className="font-semibold">{res.nb_chambres}</span>
                  <span style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>ch.</span>
                </span>
              )}
              {res.nb_salles_de_bain != null && (
                <span className="flex items-center gap-1.5">
                  <Bath size={13} strokeWidth={1.5} style={{ color: "var(--turquoise)" }} />
                  <span className="font-semibold">{res.nb_salles_de_bain}</span>
                  <span style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>sdb</span>
                </span>
              )}
              {res.surface_m2 != null && (
                <span className="flex items-center gap-1.5">
                  <Maximize2 size={13} strokeWidth={1.5} style={{ color: "var(--turquoise)" }} />
                  <span className="font-semibold">{res.surface_m2}</span>
                  <span style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>m²</span>
                </span>
              )}
            </div>
          )}

          <p className="text-sm leading-relaxed flex-1 line-clamp-2"
            style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
            {res.description}
          </p>

          {res.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {res.amenities.slice(0, 4).map(am => {
                const Icon = AMENITY_ICONS[am];
                return (
                  <span key={am} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full"
                    style={{ background: "color-mix(in oklch, var(--background) 65%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 9%, transparent)", color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                    {Icon ? <Icon size={10} strokeWidth={2} style={{ color: "var(--turquoise)" }} /> : <span style={{ color: "var(--turquoise)" }}>·</span>}
                    {am}
                  </span>
                );
              })}
              {res.amenities.length > 4 && (
                <span className="flex items-center text-[10px] px-2 py-1 rounded-full"
                  style={{ background: "color-mix(in oklch, var(--turquoise) 8%, transparent)", color: "var(--turquoise)", border: "1px solid color-mix(in oklch, var(--turquoise) 18%, transparent)" }}>
                  +{res.amenities.length - 4}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 mt-auto border-t"
            style={{ borderColor: "color-mix(in oklch, var(--gold-premium) 10%, transparent)" }}>
            <div>
              <div className="font-bold text-base" style={{ color: "var(--gold-premium)" }}>{res.price}</div>
              <div className="flex items-center gap-1 mt-0.5 text-[10px]" style={{ color: "color-mix(in oklch, var(--foreground) 42%, transparent)" }}>
                <Users size={9} />
                {res.capacity} · sur demande
              </div>
            </div>
            <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waMsg(res))}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-105 hover:shadow-md active:scale-95"
              style={{ background: "linear-gradient(135deg, var(--gold-premium), color-mix(in oklch, var(--gold-premium) 68%, var(--turquoise)))" }}>
              Réserver
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </ScrollAnimation>
  );
}
