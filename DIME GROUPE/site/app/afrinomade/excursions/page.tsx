"use client";

import Image from "next/image";
import { Timer, Check, X, Compass, ChevronLeft, ChevronRight } from "lucide-react";
import ScrollAnimation from "../../components/ScrollAnimation";
import { useWhatsApp } from "../../components/WhatsAppNumber";
import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Excursion {
  id: string; slug: string; title: string; img: string;
  duration: string; price: string; tags: string[]; pays?: string | null;
  description: string; highlights: string[];
}

interface CatalogueActivity {
  label: string;
  pays?: string;
  prix_par_personne?: number;
  prix_demi_journee?: number;
  prix_journee?: number;
  unite?: string;
}

// ─── Données statiques ────────────────────────────────────────────────────────
const PAYS_DESTINATIONS = [
  { key: "Côte d'Ivoire", flag: "🇨🇮" },
  { key: "Sénégal",       flag: "🇸🇳" },
  { key: "Ghana",         flag: "🇬🇭" },
  { key: "Maroc",         flag: "🇲🇦" },
  { key: "Bénin",         flag: "🇧🇯" },
  { key: "Togo",          flag: "🇹🇬" },
];

// Mapping clé catalogue → affichage + clé formulaire
const PAYS_CAT: Record<string, { formKey: string; flag: string; label: string }> = {
  "CI":      { formKey: "Côte d'Ivoire", flag: "🇨🇮", label: "Côte d'Ivoire" },
  "Sénégal": { formKey: "Sénégal",       flag: "🇸🇳", label: "Sénégal" },
  "Ghana":   { formKey: "Ghana",         flag: "🇬🇭", label: "Ghana" },
  "Maroc":   { formKey: "Maroc",         flag: "🇲🇦", label: "Maroc" },
  "Bénin":   { formKey: "Bénin",         flag: "🇧🇯", label: "Bénin" },
  "Togo":    { formKey: "Togo",          flag: "🇹🇬", label: "Togo" },
};

const PAYS_ORDER = ["CI", "Sénégal", "Ghana", "Maroc", "Bénin", "Togo"];

const ACTIVITES_OPTS = [
  "Plage", "Randonnée", "Safari", "Culture & Patrimoine",
  "Gastronomie", "Sports nautiques", "Village pittoresque",
  "Parc national", "Photographie", "Aventure", "Soirée & Nuit",
  "Bien-être & Spa",
];

const BUDGETS_EXCURSION = [
  "Moins de 15 000 FCFA / pers.",
  "15 000 – 35 000 FCFA / pers.",
  "35 000 – 75 000 FCFA / pers.",
  "Plus de 75 000 FCFA / pers.",
  "Pas de limite",
];

const LANGUES_GUIDE = ["Français", "Anglais", "Espagnol", "Arabe", "Dioula"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function activityEmoji(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("plage") || l.includes("beach") || l.includes("labadi"))    return "🏖️";
  if (l.includes("safari") || l.includes("faune") || l.includes("bandia") || l.includes("mole") || l.includes("pendjari") || l.includes("fazao") || l.includes("niokolo")) return "🦁";
  if (l.includes("randonnée") || l.includes("agou") || l.includes("womé") || l.includes("kpalimé")) return "🥾";
  if (l.includes("pirogue") || l.includes("saloum") || l.includes("lac togo") || l.includes("lac rose") || l.includes("kayak") || l.includes("ganvié")) return "🛶";
  if (l.includes("marché") || l.includes("dantokpa"))                         return "🛍️";
  if (l.includes("musée") || l.includes("mémorial") || l.includes("nkrumah") || l.includes("monument")) return "🏛️";
  if (l.includes("cuisine") || l.includes("gastrono") || l.includes("cours de")) return "🍽️";
  if (l.includes("jet ski") || l.includes("surf") || l.includes("nautique")) return "🏄";
  if (l.includes("montgolfière"))                                             return "🎈";
  if (l.includes("hammam") || l.includes("spa") || l.includes("massage"))    return "🧖";
  if (l.includes("quad"))                                                     return "🏍️";
  if (l.includes("calèche"))                                                  return "🐴";
  if (l.includes("cascade") || l.includes("chute"))                          return "💧";
  if (l.includes("vaudou") || l.includes("fétiche") || l.includes("python") || l.includes("festival")) return "🪆";
  if (l.includes("basilique") || l.includes("cathédrale"))                   return "⛪";
  if (l.includes("jardin") || l.includes("botanic") || l.includes("majorelle")) return "🌿";
  if (l.includes("désert") || l.includes("chameau") || l.includes("agafay") || l.includes("zagora")) return "🐪";
  if (l.includes("île") || l.includes("gorée") || l.includes("boulay") || l.includes("aneho")) return "🏝️";
  if (l.includes("forêt") || l.includes("banco"))                            return "🌳";
  if (l.includes("châtea") || l.includes("elmina") || l.includes("cape coast") || l.includes("palais") || l.includes("abomey")) return "🏰";
  if (l.includes("kente") || l.includes("tissage"))                          return "🧶";
  if (l.includes("city tour") || l.includes("tour ") || l.includes("journée complète")) return "🗺️";
  if (l.includes("caïman"))                                                   return "🐊";
  if (l.includes("assinie") || l.includes("sassandra") || l.includes("grand-bassam")) return "🌊";
  return "🗺️";
}

function activityPrice(act: CatalogueActivity): number {
  return act.prix_par_personne ?? act.prix_demi_journee ?? act.prix_journee ?? 0;
}

// ─── Formulaire de demande ────────────────────────────────────────────────────
interface FormExcursion {
  pays_destination: string;
  date_depart: string;
  date_retour: string;
  nb_adultes: number;
  nb_enfants: number;
  activites: string[];
  langue_guide: string;
  budget: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  besoins_particuliers: string;
}

const EMPTY: FormExcursion = {
  pays_destination: "",
  date_depart: "", date_retour: "",
  nb_adultes: 2, nb_enfants: 0,
  activites: [], langue_guide: "Français", budget: "",
  prenom: "", nom: "", email: "", telephone: "",
  besoins_particuliers: "",
};

// ── Modal formulaire ──────────────────────────────────────────────────────────
function ExcursionRequestModal({
  onClose, whatsapp, preset,
}: {
  onClose: () => void;
  whatsapp: string;
  preset?: Partial<FormExcursion>;
}) {
  const [step, setStep]             = useState(1);
  const [form, setForm]             = useState<FormExcursion>({ ...EMPTY, ...preset });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [errors, setErrors]         = useState<Partial<Record<keyof FormExcursion | "global", string>>>({});
  const [lastForm, setLastForm]     = useState<FormExcursion>(EMPTY);

  // Activités catalogue pour l'étape 2
  const [catalogueActs, setCatalogueActs] = useState<CatalogueActivity[]>([]);
  const [loadingActs,   setLoadingActs]   = useState(false);
  const [cataloguePays, setCataloguePays] = useState("");

  useEffect(() => {
    if (!form.pays_destination || form.pays_destination === cataloguePays) return;
    setLoadingActs(true);
    fetch(`/api/afrinomade/catalogue-public?categorie=activites&pays=${encodeURIComponent(form.pays_destination)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setCatalogueActs(data); setCataloguePays(form.pays_destination); })
      .catch(() => setCatalogueActs([]))
      .finally(() => setLoadingActs(false));
  }, [form.pays_destination, cataloguePays]);

  const set = useCallback((field: keyof FormExcursion, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const toggleActivite = (label: string) => {
    set("activites", form.activites.includes(label)
      ? form.activites.filter(a => a !== label)
      : [...form.activites, label]);
  };

  const actPrice = (label: string): number => {
    const a = catalogueActs.find(c => c.label === label);
    return a ? activityPrice(a) : 0;
  };

  const estimTotal = form.activites.reduce((s, l) => s + actPrice(l), 0) * form.nb_adultes;

  const validateStep = (s: number): boolean => {
    const errs: typeof errors = {};
    if (s === 1) {
      if (!form.pays_destination) errs.pays_destination = "Choisissez une destination";
      if (!form.date_depart)      errs.date_depart = "Indiquez la date de départ";
    }
    if (s === 3) {
      if (!form.prenom)    errs.prenom = "Requis";
      if (!form.nom)       errs.nom = "Requis";
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
      const budgetFinal = estimTotal > 0
        ? `à partir de ${estimTotal.toLocaleString("fr-FR")} FCFA (estimation catalogue)`
        : form.budget;

      const res = await fetch("/api/afrinomade/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, budget: budgetFinal, type_service: "excursion", source: "site" }),
      });
      if (res.ok) { setLastForm({ ...form, budget: budgetFinal }); setSuccess(true); }
      else setErrors({ global: "Une erreur est survenue. Veuillez réessayer." });
    } catch {
      setErrors({ global: "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const STEP_LABELS = ["Excursion", "Activités", "Contact"];
  const inputCls   = "w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all";
  const inputStyle = {
    background: "color-mix(in oklch, var(--background) 85%, transparent)",
    border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh", background: "var(--background)", border: "1px solid color-mix(in oklch, var(--turquoise) 18%, transparent)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 7%, transparent)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
              <Compass size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Excursion sur-mesure</h2>
              <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                Décrivez votre aventure idéale
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step indicators */}
        {!success && (
          <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1; const done = n < step; const active = n === step;
              return (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-1.5 ${n <= step ? "" : "opacity-40"}`}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                      style={{
                        background: done ? "var(--turquoise)" : active ? "color-mix(in oklch, var(--turquoise) 80%, var(--gold-premium))" : "color-mix(in oklch, var(--foreground) 10%, transparent)",
                        color: (done || active) ? "white" : "color-mix(in oklch, var(--foreground) 50%, transparent)",
                      }}>
                      {done ? <Check size={11} /> : n}
                    </div>
                    <span className="text-xs font-medium hidden sm:block"
                      style={{ color: active ? "var(--turquoise)" : done ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">

          {/* SUCCESS */}
          {success ? (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 60%, var(--gold-premium)))" }}>
                <Check size={32} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Demande envoyée ✅</h3>
                <p className="text-sm max-w-xs" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                  Votre demande d&apos;excursion a bien été reçue. Notre équipe vous contacte sous{" "}
                  <strong style={{ color: "var(--turquoise)" }}>24h</strong>.
                </p>
              </div>
              <div className="w-full rounded-xl px-4 py-3 text-xs text-left space-y-1.5"
                style={{ background: "color-mix(in oklch, var(--turquoise) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)" }}>
                {lastForm.pays_destination && <p>📍 {lastForm.pays_destination}</p>}
                {lastForm.date_depart && <p>📅 {lastForm.date_depart}{lastForm.date_retour ? ` → ${lastForm.date_retour}` : ""}</p>}
                <p>👥 {lastForm.nb_adultes} adulte(s){lastForm.nb_enfants > 0 ? ` + ${lastForm.nb_enfants} enfant(s)` : ""}</p>
                {lastForm.activites.length > 0 && (
                  <div>
                    <p className="mb-1">🎯 {lastForm.activites.length} activité{lastForm.activites.length > 1 ? "s" : ""} :</p>
                    <ul className="pl-3 space-y-0.5 opacity-80">
                      {lastForm.activites.slice(0, 4).map(a => <li key={a}>· {a}</li>)}
                      {lastForm.activites.length > 4 && <li>· +{lastForm.activites.length - 4} autres</li>}
                    </ul>
                  </div>
                )}
                {lastForm.budget && <p>💰 {lastForm.budget}</p>}
              </div>
              <div className="w-full space-y-2.5">
                <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                  Besoin d&apos;une réponse immédiate ?
                </p>
                <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                    `Bonjour AfriNomade 👋 Je viens de soumettre une demande d'excursion sur-mesure :\n` +
                    `📍 ${lastForm.pays_destination || "—"}\n` +
                    `📅 ${lastForm.date_depart || "—"}${lastForm.date_retour ? ` → ${lastForm.date_retour}` : ""}\n` +
                    `👥 ${lastForm.nb_adultes} adulte(s)${lastForm.nb_enfants > 0 ? ` + ${lastForm.nb_enfants} enfant(s)` : ""}\n` +
                    `🎯 ${lastForm.activites.length > 0 ? lastForm.activites.join(", ") : "Non précisé"}\n` +
                    `💰 ${lastForm.budget || "Non précisé"}\n` +
                    `\nPrénom : ${lastForm.prenom} ${lastForm.nom}\nTél : ${lastForm.telephone}`
                  )}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full rounded-full py-3 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: "#25D366" }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Confirmer via WhatsApp
                </a>
                <button onClick={onClose}
                  className="w-full rounded-full py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                  Fermer
                </button>
              </div>
            </div>

          ) : step === 1 ? (
            /* ─ Étape 1 : Destination & Dates ─ */
            <div className="space-y-5 py-2">
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                  Destination *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYS_DESTINATIONS.map(p => (
                    <button key={p.key} type="button" onClick={() => set("pays_destination", p.key)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all"
                      style={{
                        background: form.pays_destination === p.key ? "color-mix(in oklch, var(--turquoise) 15%, transparent)" : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                        border: `1px solid ${form.pays_destination === p.key ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                        color: form.pays_destination === p.key ? "var(--turquoise)" : undefined,
                      }}>
                      {p.flag} {p.key}
                    </button>
                  ))}
                </div>
                {errors.pays_destination && <p className="text-xs text-red-400 mt-1">{errors.pays_destination}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>Date de départ *</label>
                  <input type="date" value={form.date_depart} onChange={e => set("date_depart", e.target.value)}
                    min={new Date().toISOString().split("T")[0]} className={inputCls} style={inputStyle} />
                  {errors.date_depart && <p className="text-xs text-red-400 mt-1">{errors.date_depart}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>Date de retour</label>
                  <input type="date" value={form.date_retour} onChange={e => set("date_retour", e.target.value)}
                    min={form.date_depart || new Date().toISOString().split("T")[0]} className={inputCls} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>Nombre de voyageurs</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { label: "Adultes", field: "nb_adultes" as const, min: 1, val: form.nb_adultes },
                    { label: "Enfants", field: "nb_enfants" as const, min: 0, val: form.nb_enfants },
                  ]).map(({ label, field, min, val }) => (
                    <div key={field} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={inputStyle}>
                      <span className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>{label}</span>
                      <div className="flex items-center gap-2.5">
                        <button type="button" onClick={() => set(field, Math.max(min, val - 1))}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", color: "var(--turquoise)" }}>−</button>
                        <span className="text-sm font-bold w-4 text-center">{val}</span>
                        <button type="button" onClick={() => set(field, val + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", color: "var(--turquoise)" }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          ) : step === 2 ? (
            /* ─ Étape 2 : Activités ─ */
            <div className="space-y-5 py-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                    {form.pays_destination ? `Activités à ${form.pays_destination}` : "Activités souhaitées"}
                    <span className="font-normal opacity-60 ml-1">(plusieurs choix)</span>
                  </label>
                  {form.activites.length > 0 && (
                    <span className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                      style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", color: "var(--turquoise)" }}>
                      {form.activites.length} sélectionnée{form.activites.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {loadingActs ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className="rounded-xl h-11 animate-pulse"
                        style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }} />
                    ))}
                  </div>
                ) : catalogueActs.length > 0 ? (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                    {catalogueActs.map(act => {
                      const sel  = form.activites.includes(act.label);
                      const prix = activityPrice(act);
                      return (
                        <button key={act.label} type="button" onClick={() => toggleActivite(act.label)}
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-left font-medium transition-all flex items-center justify-between gap-3"
                          style={{
                            background: sel ? "color-mix(in oklch, var(--turquoise) 12%, transparent)" : "color-mix(in oklch, var(--foreground) 3.5%, transparent)",
                            border: `1px solid ${sel ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 8%, transparent)"}`,
                          }}>
                          <span className="flex items-center gap-2" style={{ color: sel ? "var(--turquoise)" : undefined }}>
                            <span className="text-base">{activityEmoji(act.label)}</span>
                            {sel && <Check size={12} strokeWidth={3} className="shrink-0" />}
                            {act.label}
                          </span>
                          {prix > 0 && (
                            <span className="text-xs font-bold shrink-0"
                              style={{ color: sel ? "var(--turquoise)" : "var(--gold-premium)" }}>
                              {prix.toLocaleString("fr-FR")} F
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITES_OPTS.map(act => {
                      const sel = form.activites.includes(act);
                      return (
                        <button key={act} type="button" onClick={() => toggleActivite(act)}
                          className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                          style={{
                            background: sel ? "color-mix(in oklch, var(--turquoise) 15%, transparent)" : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                            border: `1px solid ${sel ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                            color: sel ? "var(--turquoise)" : undefined,
                          }}>
                          {sel ? "✓ " : ""}{act}
                        </button>
                      );
                    })}
                  </div>
                )}

                {estimTotal > 0 && (
                  <div className="mt-2 rounded-xl px-3 py-2.5 flex items-center justify-between text-xs"
                    style={{ background: "color-mix(in oklch, var(--gold-premium) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--gold-premium) 15%, transparent)" }}>
                    <span style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                      Estimation ({form.activites.length} activité{form.activites.length > 1 ? "s" : ""} × {form.nb_adultes} pers.)
                    </span>
                    <span className="font-bold" style={{ color: "var(--gold-premium)" }}>
                      à partir de {estimTotal.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                  Langue du guide
                </label>
                <select value={form.langue_guide} onChange={e => set("langue_guide", e.target.value)}
                  className={inputCls} style={inputStyle}>
                  {LANGUES_GUIDE.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {estimTotal === 0 && (
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                    Budget par personne
                  </label>
                  <div className="space-y-1.5">
                    {BUDGETS_EXCURSION.map(b => (
                      <button key={b} type="button" onClick={() => set("budget", b)}
                        className="w-full rounded-xl px-3 py-2.5 text-sm text-left font-medium transition-all"
                        style={{
                          background: form.budget === b ? "color-mix(in oklch, var(--turquoise) 12%, transparent)" : "color-mix(in oklch, var(--foreground) 3%, transparent)",
                          border: `1px solid ${form.budget === b ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 8%, transparent)"}`,
                          color: form.budget === b ? "var(--turquoise)" : undefined,
                        }}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ─ Étape 3 : Contact ─ */
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>Prénom *</label>
                  <input value={form.prenom} onChange={e => set("prenom", e.target.value)} className={inputCls} style={inputStyle} placeholder="Aminata" />
                  {errors.prenom && <p className="text-xs text-red-400 mt-1">{errors.prenom}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>Nom *</label>
                  <input value={form.nom} onChange={e => set("nom", e.target.value)} className={inputCls} style={inputStyle} placeholder="Koné" />
                  {errors.nom && <p className="text-xs text-red-400 mt-1">{errors.nom}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>Email *</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} style={inputStyle} placeholder="votre@email.com" />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>Téléphone / WhatsApp *</label>
                <input type="tel" value={form.telephone} onChange={e => set("telephone", e.target.value)} className={inputCls} style={inputStyle} placeholder="+225 00 00 00 00 00" />
                {errors.telephone && <p className="text-xs text-red-400 mt-1">{errors.telephone}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                  Besoins particuliers <span className="font-normal opacity-60">(optionnel)</span>
                </label>
                <textarea value={form.besoins_particuliers} onChange={e => set("besoins_particuliers", e.target.value)}
                  rows={3} placeholder="Mobilité réduite, groupe scolaire, thème spécial…"
                  className={inputCls + " resize-none"} style={inputStyle} />
              </div>
              {errors.global && <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{errors.global}</p>}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {!success && (
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid color-mix(in oklch, var(--foreground) 7%, transparent)" }}>
            {step > 1 ? (
              <button onClick={prev}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-white/5"
                style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                <ChevronLeft size={15} /> Retour
              </button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={next}
                className="flex items-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                Suivant <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
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
export default function AfriExcursions() {
  const whatsapp = useWhatsApp("afri");

  // Excursions vedettes
  const [excursions,  setExcursions]  = useState<Excursion[]>([]);
  const [loadingExc,  setLoadingExc]  = useState(true);
  const [activeTag,   setActiveTag]   = useState("Tous");

  // Catalogue toutes activités
  const [allCatActs,     setAllCatActs]     = useState<CatalogueActivity[]>([]);
  const [loadingCat,     setLoadingCat]     = useState(true);
  const [catPaysFilter,  setCatPaysFilter]  = useState(PAYS_ORDER[0]); // "CI" par défaut

  // Modal
  const [showForm,    setShowForm]    = useState(false);
  const [formPreset,  setFormPreset]  = useState<Partial<FormExcursion>>({});

  useEffect(() => {
    // Excursions vedettes
    fetch("/api/afrinomade/excursions")
      .then(r => r.ok ? r.json() : [])
      .then(data => { setExcursions(data); setLoadingExc(false); })
      .catch(() => setLoadingExc(false));

    // Toutes les activités catalogue (sans filtre pays)
    fetch("/api/afrinomade/catalogue-public?categorie=activites")
      .then(r => r.ok ? r.json() : [])
      .then(data => { setAllCatActs(data); setLoadingCat(false); })
      .catch(() => setLoadingCat(false));
  }, []);

  const openWithPreset = (pays: string, label?: string) => {
    setFormPreset({ pays_destination: pays, activites: label ? [label] : [] });
    setShowForm(true);
  };

  // Pays disponibles dans les excursions vedettes
  const [activePays, setActivePays] = useState("Tous");

  // Excursions vedettes filtrées par pays puis par tag
  const paysDispos = ["Tous", ...Array.from(new Set(
    excursions.map(e => e.pays).filter((p): p is string => !!p)
  ))];
  const excByPays  = activePays === "Tous" ? excursions : excursions.filter(e => e.pays === activePays);
  const allTags    = ["Tous", ...Array.from(new Set(excByPays.flatMap(e => e.tags)))];
  const filtered   = activeTag === "Tous" ? excByPays : excByPays.filter(e => e.tags.includes(activeTag));

  // Activités catalogue pour le pays sélectionné
  const catActsByPays = allCatActs.filter(a => a.pays === catPaysFilter);

  // Comptage par pays pour les onglets
  const catCountByPays = (key: string) => allCatActs.filter(a => a.pays === key).length;

  const waMsg = (ex: Excursion) =>
    `Bonjour AfriNomade ! Je suis intéressé(e) par l'excursion "${ex.title}". Pouvez-vous me donner plus d'informations ?`;

  return (
    <>
      {showForm && (
        <ExcursionRequestModal
          key={JSON.stringify(formPreset)}
          onClose={() => { setShowForm(false); setFormPreset({}); }}
          whatsapp={whatsapp}
          preset={formPreset}
        />
      )}

      <main className="container py-16">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex-1">
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--turquoise)" }}>
                AfriNomade · Découvertes
              </span>
              <h1 className="mt-2 text-3xl md:text-5xl font-bold leading-tight">
                Excursions<br /><span style={{ color: "var(--turquoise)" }}>guidées</span>
              </h1>
              <p className="mt-3 text-sm max-w-md leading-relaxed"
                style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                Plages, forêts, villages et parcs nationaux — découvrez l&apos;Afrique guidé par des passionnés du terrain.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {[{ icon: "🗺️", label: "Circuits guidés" }, { icon: "👥", label: "Groupes & individuels" }, { icon: "⭐", label: "Guides locaux experts" }].map(({ icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                    style={{ background: "color-mix(in oklch, var(--turquoise) 10%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)", color: "color-mix(in oklch, var(--turquoise) 90%, var(--foreground))" }}>
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5 items-start md:items-end">
              <button onClick={() => openWithPreset("")}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                <Compass size={15} /> Excursion sur-mesure
              </button>
              <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Bonjour AfriNomade ! Je souhaite organiser une excursion.")}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all hover:bg-white/5"
                style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </ScrollAnimation>

        {/* ══ EXCURSIONS VEDETTES ══════════════════════════════════════════════ */}
        {!loadingExc && excursions.length > 0 && (
          <>
            <ScrollAnimation animation="fadeInUp" delay={80}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--turquoise)" }}>À la une</span>
                <div className="flex-1 h-px" style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)" }} />
              </div>
            </ScrollAnimation>

            {/* Filtre par pays */}
            {paysDispos.length > 2 && (
              <ScrollAnimation animation="fadeInUp" delay={90}>
                <div className="flex flex-wrap gap-2 mb-4">
                  {paysDispos.map(p => {
                    const info = PAYS_CAT[
                      Object.keys(PAYS_CAT).find(k => PAYS_CAT[k].formKey === p) ?? ""
                    ];
                    const label = p === "Tous" ? `🌍 Tous les pays` : `${info?.flag ?? ""} ${p}`;
                    const active = activePays === p;
                    return (
                      <button key={p} onClick={() => { setActivePays(p); setActiveTag("Tous"); }}
                        className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200"
                        style={{
                          background: active ? "var(--gold-premium)" : "color-mix(in oklch, var(--gold-premium) 8%, transparent)",
                          color: active ? "white" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                          border: `1px solid ${active ? "var(--gold-premium)" : "color-mix(in oklch, var(--gold-premium) 20%, transparent)"}`,
                        }}>
                        {label}
                        <span className="ml-1 opacity-70">
                          ({(p === "Tous" ? excursions : excursions.filter(e => e.pays === p)).length})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ScrollAnimation>
            )}

            {/* Tag filter */}
            <ScrollAnimation animation="fadeInUp" delay={100}>
              <div className="flex flex-wrap gap-2 mb-8">
                {allTags.map(tag => (
                  <button key={tag} onClick={() => setActiveTag(tag)}
                    className="rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200"
                    style={{
                      background: activeTag === tag ? "var(--turquoise)" : "color-mix(in oklch, var(--turquoise) 10%, transparent)",
                      color: activeTag === tag ? "white" : "color-mix(in oklch, var(--foreground) 70%, transparent)",
                      border: "1px solid color-mix(in oklch, var(--turquoise) 25%, transparent)",
                    }}>
                    {tag}
                  </button>
                ))}
              </div>
            </ScrollAnimation>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((ex, i) => (
                <ScrollAnimation key={ex.id} animation="fadeInUp" delay={i * 80}>
                  <div className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full"
                    style={{ background: "color-mix(in oklch, var(--background) 85%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)" }}>
                    <div className="relative h-52 overflow-hidden flex-shrink-0">
                      {ex.img ? (
                        <Image src={ex.img} alt={ex.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl"
                          style={{ background: "color-mix(in oklch, var(--turquoise) 8%, var(--background))" }}>🗺️</div>
                      )}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: "linear-gradient(to top, color-mix(in oklch, #0a1a1a 60%, transparent), transparent)" }} />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[70%]">
                        {ex.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
                            style={{ background: "color-mix(in oklch, var(--turquoise) 80%, #0a1a1a)" }}>{tag}</span>
                        ))}
                      </div>
                      <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white flex items-center gap-1"
                        style={{ background: "color-mix(in oklch, #0a1a1a 70%, transparent)", backdropFilter: "blur(8px)" }}>
                        <Timer size={11} style={{ color: "var(--turquoise)" }} strokeWidth={2} />{ex.duration}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 p-5 flex-1">
                      <h3 className="font-bold text-base leading-snug">{ex.title}</h3>
                      <p className="text-sm leading-relaxed flex-1" style={{ color: "color-mix(in oklch, var(--foreground) 68%, transparent)" }}>{ex.description}</p>
                      {ex.highlights.length > 0 && (
                        <ul className="flex flex-wrap gap-x-4 gap-y-1">
                          {ex.highlights.slice(0, 3).map(h => (
                            <li key={h} className="text-xs flex items-center gap-1" style={{ color: "color-mix(in oklch, var(--turquoise) 80%, var(--foreground))" }}>
                              <Check size={11} className="inline-block shrink-0" style={{ color: "var(--turquoise)" }} strokeWidth={2.5} />{h}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "color-mix(in oklch, var(--turquoise) 10%, transparent)" }}>
                        <span className="text-sm font-bold" style={{ color: "var(--gold-premium)" }}>{ex.price}</span>
                        <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waMsg(ex))}`}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105"
                          style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                          Réserver
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </>
        )}

        {/* Loading skeletons vedettes */}
        {loadingExc && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {[1, 2, 3].map(n => (
              <div key={n} className="rounded-2xl overflow-hidden animate-pulse"
                style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)", height: "340px" }} />
            ))}
          </div>
        )}

        {/* ══ TOUTES LES ACTIVITÉS DU CATALOGUE ════════════════════════════════ */}
        <ScrollAnimation animation="fadeInUp" delay={120}>
          <div className="mt-16">
            {/* Titre section */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold-premium)" }}>Catalogue complet</span>
              <div className="flex-1 h-px" style={{ background: "color-mix(in oklch, var(--gold-premium) 15%, transparent)" }} />
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold">Toutes les activités disponibles</h2>
                <p className="text-sm mt-1" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                  {allCatActs.length} activités répertoriées dans 6 pays — avec tarifs indicatifs
                </p>
              </div>
              <button onClick={() => openWithPreset(PAYS_CAT[catPaysFilter]?.formKey ?? "")}
                className="shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                <Compass size={14} /> Composer mon circuit
              </button>
            </div>

            {/* Onglets pays */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {PAYS_ORDER.map(key => {
                const info  = PAYS_CAT[key];
                const count = catCountByPays(key);
                if (!count) return null;
                const active = catPaysFilter === key;
                return (
                  <button key={key} onClick={() => setCatPaysFilter(key)}
                    className="rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150"
                    style={{
                      background: active ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                      color: active ? "white" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                      border: `1px solid ${active ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                    }}>
                    {info.flag} {info.label} <span className="opacity-70 ml-0.5">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Grille activités */}
            {loadingCat ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <div key={n} className="rounded-2xl h-28 animate-pulse"
                    style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {catActsByPays.map((act, i) => {
                  const prix  = activityPrice(act);
                  const info  = PAYS_CAT[act.pays ?? ""];
                  const formPays = info?.formKey ?? act.pays ?? "";
                  return (
                    <ScrollAnimation key={act.label} animation="fadeInUp" delay={i * 30}>
                      <div className="rounded-2xl p-4 flex flex-col gap-3 h-full group cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: "color-mix(in oklch, var(--background) 80%, transparent)",
                          border: "1px solid color-mix(in oklch, var(--turquoise) 12%, transparent)",
                        }}
                        onClick={() => openWithPreset(formPays, act.label)}>
                        {/* Emoji + nom */}
                        <div>
                          <div className="text-2xl mb-2">{activityEmoji(act.label)}</div>
                          <p className="text-sm font-semibold leading-snug group-hover:text-[--turquoise] transition-colors">
                            {act.label}
                          </p>
                        </div>
                        {/* Prix + bouton */}
                        <div className="mt-auto flex items-center justify-between gap-2">
                          {prix > 0 ? (
                            <span className="text-xs font-bold" style={{ color: "var(--gold-premium)" }}>
                              {prix.toLocaleString("fr-FR")} FCFA
                            </span>
                          ) : <span />}
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2.5 py-1 transition-all group-hover:scale-105"
                            style={{ background: "color-mix(in oklch, var(--turquoise) 12%, transparent)", color: "var(--turquoise)", border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)" }}>
                            Demander
                          </span>
                        </div>
                      </div>
                    </ScrollAnimation>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollAnimation>

        {/* ── CTA sur-mesure ────────────────────────────────────────────────── */}
        <ScrollAnimation animation="fadeInUp" delay={200}>
          <div className="mt-14 rounded-2xl overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, color-mix(in oklch, var(--turquoise) 10%, var(--background)), color-mix(in oklch, var(--gold-premium) 6%, var(--background)))",
              border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)",
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 80% 50%, color-mix(in oklch, var(--turquoise) 8%, transparent) 0%, transparent 60%)" }} />
            <div className="relative px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <div className="text-4xl mb-3">🧭</div>
                <h3 className="font-bold text-xl mb-2">Vous avez une idée en tête ?</h3>
                <p className="text-sm max-w-md" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                  Destination hors liste, groupe, thématique spéciale — on crée votre circuit sur-mesure avec un guide dédié.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 items-center md:items-end shrink-0">
                <button onClick={() => openWithPreset("")}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                  <Compass size={15} /> Demander un circuit sur-mesure
                </button>
                <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Bonjour AfriNomade ! Je souhaite organiser une excursion sur-mesure.")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-105 whitespace-nowrap"
                  style={{ background: "#25D366" }}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp direct
                </a>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </main>
    </>
  );
}
