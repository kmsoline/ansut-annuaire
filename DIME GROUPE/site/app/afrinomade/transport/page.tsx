"use client";

import { Plane, Car, Bus, Map, Star, Shield, Clock, Phone, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import ScrollAnimation from "../../components/ScrollAnimation";
import { useWhatsApp } from "../../components/WhatsAppNumber";
import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Formule {
  id: string; title: string; description: string; price: string;
  details: string[]; popular: boolean; icon_name: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  Plane, Car, Bus, Map, Shield, Clock, Phone,
};

// ─── Données statiques ────────────────────────────────────────────────────────
const FLEET = [
  { type: "Berline",  capacity: "1–3 pers.", icon: "🚗", desc: "Toyota Corolla ou similaire" },
  { type: "SUV",      capacity: "1–4 pers.", icon: "🚙", desc: "Toyota Fortuner ou similaire" },
  { type: "Minibus",  capacity: "5–14 pers.", icon: "🚌", desc: "Toyota Hiace ou similaire" },
];

const TYPES_TRAJET = [
  { key: "Transfert aéroport", icon: "✈️", desc: "Prise en charge ou dépose aéroport" },
  { key: "Mise à disposition", icon: "🕐", desc: "Véhicule + chauffeur à la journée" },
  { key: "Intercités",          icon: "🛣️", desc: "Trajet entre deux villes" },
  { key: "Excursion en véhicule", icon: "🗺️", desc: "Journée découverte guidée" },
];

const TYPES_VEHICULE = [
  { key: "Berline",  icon: "🚗", cap: "1–3 pers." },
  { key: "SUV",      icon: "🚙", cap: "1–4 pers." },
  { key: "Minibus",  icon: "🚌", cap: "5–14 pers." },
];

const OPTIONS_TRANSPORT = [
  "Guide francophone inclus",
  "Service nuit",
  "Aller-retour",
  "Siège enfant",
  "Eau minérale incluse",
];

// ─── Formulaire ───────────────────────────────────────────────────────────────
interface FormTransport {
  type_trajet: string;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  heure_depart: string;
  nb_adultes: number;
  nb_enfants: number;
  type_vehicule: string;
  options: string[];
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  besoins_particuliers: string;
}

const EMPTY_FORM: FormTransport = {
  type_trajet: "",
  ville_depart: "", ville_arrivee: "",
  date_depart: "", heure_depart: "",
  nb_adultes: 1, nb_enfants: 0,
  type_vehicule: "",
  options: [],
  prenom: "", nom: "", email: "", telephone: "",
  besoins_particuliers: "",
};

// ── Modal ─────────────────────────────────────────────────────────────────────
function TransportRequestModal({
  onClose, whatsapp, preset,
}: {
  onClose: () => void;
  whatsapp: string;
  preset?: Partial<FormTransport>;
}) {
  const [step, setStep]             = useState(1);
  const [form, setForm]             = useState<FormTransport>({ ...EMPTY_FORM, ...preset });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [errors, setErrors]         = useState<Partial<Record<keyof FormTransport | "global", string>>>({});
  const [lastForm, setLastForm]     = useState<FormTransport>(EMPTY_FORM);

  const set = useCallback((field: keyof FormTransport, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const toggleOption = (opt: string) => {
    set("options", form.options.includes(opt)
      ? form.options.filter(o => o !== opt)
      : [...form.options, opt]);
  };

  const validateStep = (s: number): boolean => {
    const errs: typeof errors = {};
    if (s === 1) {
      if (!form.type_trajet)  errs.type_trajet  = "Choisissez un type de service";
      if (!form.ville_depart) errs.ville_depart = "Indiquez la ville de départ";
      if (!form.date_depart)  errs.date_depart  = "Indiquez la date";
    }
    if (s === 3) {
      if (!form.prenom)    errs.prenom = "Requis";
      if (!form.nom)       errs.nom    = "Requis";
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
      const commentaire = [
        form.type_trajet,
        form.heure_depart ? `Heure: ${form.heure_depart}` : "",
        form.options.length ? `Options: ${form.options.join(", ")}` : "",
      ].filter(Boolean).join(" · ");

      const res = await fetch("/api/afrinomade/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_service: "transport",
          villes: [form.ville_depart, form.ville_arrivee].filter(Boolean),
          pays_destination: form.ville_arrivee || form.ville_depart,
          date_depart: form.date_depart,
          nb_adultes: form.nb_adultes,
          nb_enfants: form.nb_enfants,
          type_vehicule: form.type_vehicule,
          commentaire,
          besoins_particuliers: form.besoins_particuliers,
          prenom: form.prenom, nom: form.nom,
          email: form.email, telephone: form.telephone,
          source: "site",
        }),
      });
      if (res.ok) { setLastForm({ ...form }); setSuccess(true); }
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

  const STEP_LABELS = ["Trajet", "Véhicule", "Contact"];
  const inputCls    = "w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all";
  const inputStyle  = {
    background: "color-mix(in oklch, var(--background) 85%, transparent)",
    border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)",
  };

  const WA_LOGO = (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

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
              <Car size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Réserver un transport</h2>
              <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                Chauffeur professionnel, véhicule confortable
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

          {success ? (
            /* ── SUCCESS ── */
            <div className="flex flex-col items-center justify-center text-center py-8 gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 60%, var(--gold-premium)))" }}>
                <Check size={32} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Demande envoyée ✅</h3>
                <p className="text-sm max-w-xs" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                  Votre demande de transport a bien été reçue. Notre équipe vous répond sous{" "}
                  <strong style={{ color: "var(--turquoise)" }}>2h</strong>.
                </p>
              </div>
              <div className="w-full rounded-xl px-4 py-3 text-xs text-left space-y-1.5"
                style={{ background: "color-mix(in oklch, var(--turquoise) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)" }}>
                {lastForm.type_trajet && <p>🚗 {lastForm.type_trajet}</p>}
                {lastForm.ville_depart && <p>📍 {lastForm.ville_depart}{lastForm.ville_arrivee ? ` → ${lastForm.ville_arrivee}` : ""}</p>}
                {lastForm.date_depart && <p>📅 {lastForm.date_depart}{lastForm.heure_depart ? ` à ${lastForm.heure_depart}` : ""}</p>}
                <p>👥 {lastForm.nb_adultes} adulte(s){lastForm.nb_enfants > 0 ? ` + ${lastForm.nb_enfants} enfant(s)` : ""}</p>
                {lastForm.type_vehicule && <p>🚙 {lastForm.type_vehicule}</p>}
                {lastForm.options.length > 0 && <p>✅ {lastForm.options.join(", ")}</p>}
              </div>
              <div className="w-full space-y-2.5">
                <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                  Besoin d&apos;une confirmation immédiate ?
                </p>
                <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                    `Bonjour AfriNomade 👋 Je viens de soumettre une demande de transport :\n` +
                    `🚗 ${lastForm.type_trajet || "—"}\n` +
                    `📍 ${lastForm.ville_depart || "—"}${lastForm.ville_arrivee ? ` → ${lastForm.ville_arrivee}` : ""}\n` +
                    `📅 ${lastForm.date_depart || "—"}${lastForm.heure_depart ? ` à ${lastForm.heure_depart}` : ""}\n` +
                    `👥 ${lastForm.nb_adultes} adulte(s)${lastForm.nb_enfants > 0 ? ` + ${lastForm.nb_enfants} enfant(s)` : ""}\n` +
                    `🚙 ${lastForm.type_vehicule || "Non précisé"}\n` +
                    (lastForm.options.length ? `✅ ${lastForm.options.join(", ")}\n` : "") +
                    `\nPrénom : ${lastForm.prenom} ${lastForm.nom}\nTél : ${lastForm.telephone}`
                  )}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full rounded-full py-3 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: "#25D366" }}>
                  {WA_LOGO} Confirmer via WhatsApp
                </a>
                <button onClick={onClose}
                  className="w-full rounded-full py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                  Fermer
                </button>
              </div>
            </div>

          ) : step === 1 ? (
            /* ── Étape 1 : Trajet ── */
            <div className="space-y-5 py-2">
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                  Type de service *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES_TRAJET.map(t => (
                    <button key={t.key} type="button" onClick={() => set("type_trajet", t.key)}
                      className="rounded-xl px-3 py-3 text-left transition-all"
                      style={{
                        background: form.type_trajet === t.key ? "color-mix(in oklch, var(--turquoise) 15%, transparent)" : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                        border: `1px solid ${form.type_trajet === t.key ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                        color: form.type_trajet === t.key ? "var(--turquoise)" : undefined,
                      }}>
                      <div className="text-xl mb-1">{t.icon}</div>
                      <div className="text-xs font-semibold">{t.key}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.type_trajet && <p className="text-xs text-red-400 mt-1">{errors.type_trajet}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                    Ville de départ *
                  </label>
                  <input value={form.ville_depart} onChange={e => set("ville_depart", e.target.value)}
                    placeholder="Ex: Abidjan" className={inputCls} style={inputStyle} />
                  {errors.ville_depart && <p className="text-xs text-red-400 mt-1">{errors.ville_depart}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                    Destination
                  </label>
                  <input value={form.ville_arrivee} onChange={e => set("ville_arrivee", e.target.value)}
                    placeholder="Ex: Assinie" className={inputCls} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>Date *</label>
                  <input type="date" value={form.date_depart} onChange={e => set("date_depart", e.target.value)}
                    min={new Date().toISOString().split("T")[0]} className={inputCls} style={inputStyle} />
                  {errors.date_depart && <p className="text-xs text-red-400 mt-1">{errors.date_depart}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>Heure de départ</label>
                  <input type="time" value={form.heure_depart} onChange={e => set("heure_depart", e.target.value)}
                    className={inputCls} style={inputStyle} />
                </div>
              </div>
            </div>

          ) : step === 2 ? (
            /* ── Étape 2 : Véhicule & Options ── */
            <div className="space-y-5 py-2">
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                  Véhicule souhaité <span className="font-normal opacity-60">(facultatif)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES_VEHICULE.map(v => (
                    <button key={v.key} type="button" onClick={() => set("type_vehicule", form.type_vehicule === v.key ? "" : v.key)}
                      className="rounded-xl px-3 py-3 text-center transition-all"
                      style={{
                        background: form.type_vehicule === v.key ? "color-mix(in oklch, var(--turquoise) 15%, transparent)" : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                        border: `1px solid ${form.type_vehicule === v.key ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                        color: form.type_vehicule === v.key ? "var(--turquoise)" : undefined,
                      }}>
                      <div className="text-2xl mb-1">{v.icon}</div>
                      <div className="text-xs font-semibold">{v.key}</div>
                      <div className="text-[10px] opacity-60">{v.cap}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>Nombre de personnes</label>
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
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                  Options souhaitées <span className="font-normal opacity-60">(facultatif)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {OPTIONS_TRANSPORT.map(opt => {
                    const sel = form.options.includes(opt);
                    return (
                      <button key={opt} type="button" onClick={() => toggleOption(opt)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                          background: sel ? "color-mix(in oklch, var(--turquoise) 15%, transparent)" : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                          border: `1px solid ${sel ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                          color: sel ? "var(--turquoise)" : undefined,
                        }}>
                        {sel ? "✓ " : ""}{opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          ) : (
            /* ── Étape 3 : Contact ── */
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
                  Informations complémentaires <span className="font-normal opacity-60">(optionnel)</span>
                </label>
                <textarea value={form.besoins_particuliers} onChange={e => set("besoins_particuliers", e.target.value)}
                  rows={3} placeholder="Numéro de vol, heure d'atterrissage, instructions particulières…"
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
export default function AfriTransport() {
  const whatsapp = useWhatsApp("afri");
  const [formules, setFormules]       = useState<Formule[]>([]);
  const [loadingFormules, setLoading] = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [formPreset, setFormPreset]   = useState<Partial<FormTransport>>({});

  useEffect(() => {
    fetch("/api/afrinomade/transport")
      .then(r => r.ok ? r.json() : [])
      .then(data => { setFormules(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const openWithPreset = (preset?: Partial<FormTransport>) => {
    setFormPreset(preset ?? {});
    setShowForm(true);
  };

  const WA_ICON_SM = (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  return (
    <>
      {showForm && (
        <TransportRequestModal
          key={JSON.stringify(formPreset)}
          onClose={() => { setShowForm(false); setFormPreset({}); }}
          whatsapp={whatsapp}
          preset={formPreset}
        />
      )}

      <main className="container py-16">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex-1">
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--turquoise)" }}>
                AfriNomade · Mobilité
              </span>
              <h1 className="mt-2 text-3xl md:text-5xl font-bold leading-tight">
                Transport<br /><span style={{ color: "var(--turquoise)" }}>& Voyages</span>
              </h1>
              <p className="mt-3 text-sm max-w-md leading-relaxed"
                style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                Chauffeurs professionnels et véhicules entretenus — transferts aéroport, mises à disposition ou trajets intercités.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {[{ icon: "🛡️", label: "Chauffeurs vérifiés" }, { icon: "⏱️", label: "Ponctualité garantie" }, { icon: "📞", label: "Assistance 24h/24" }].map(({ icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                    style={{ background: "color-mix(in oklch, var(--turquoise) 10%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)", color: "color-mix(in oklch, var(--turquoise) 90%, var(--foreground))" }}>
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5 items-start md:items-end">
              <button onClick={() => openWithPreset()}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                <Car size={15} /> Réserver un transport
              </button>
              <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Bonjour AfriNomade ! Je souhaite réserver un transport.")}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all hover:bg-white/5"
                style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                {WA_ICON_SM} WhatsApp
              </a>
            </div>
          </div>
        </ScrollAnimation>

        {/* ── Formules ──────────────────────────────────────────────────────── */}
        {loadingFormules ? (
          <div className="grid gap-5 md:grid-cols-2 mb-12">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="rounded-2xl h-48 animate-pulse"
                style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }} />
            ))}
          </div>
        ) : formules.length > 0 && (
          <>
            <ScrollAnimation animation="fadeInUp" delay={80}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--turquoise)" }}>Nos formules</span>
                <div className="flex-1 h-px" style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)" }} />
              </div>
            </ScrollAnimation>
            <div className="grid gap-5 md:grid-cols-2 mb-12">
              {formules.map((f, i) => {
                const Icon = ICON_MAP[f.icon_name] || Car;
                return (
                  <ScrollAnimation key={f.id} animation="fadeInUp" delay={i * 80}>
                    <div className="relative group rounded-2xl p-6 h-full flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                      style={{
                        background: f.popular
                          ? "linear-gradient(135deg, color-mix(in oklch, var(--turquoise) 15%, var(--background)), color-mix(in oklch, var(--gold-premium) 10%, var(--background)))"
                          : "color-mix(in oklch, var(--background) 85%, transparent)",
                        border: f.popular
                          ? "1.5px solid color-mix(in oklch, var(--turquoise) 40%, transparent)"
                          : "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)",
                      }}>
                      {f.popular && (
                        <div className="absolute -top-3 left-5 rounded-full px-3 py-0.5 text-[10px] font-bold text-white"
                          style={{ background: "linear-gradient(135deg, var(--turquoise), var(--gold-premium))" }}>
                          <Star size={10} className="inline-block mr-0.5 -mt-px" fill="white" strokeWidth={0} />Le plus demandé
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "color-mix(in oklch, var(--turquoise) 12%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)" }}>
                          <Icon size={22} strokeWidth={1.8} style={{ color: "var(--turquoise)" }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">{f.title}</h3>
                          <p className="text-sm mt-1 leading-relaxed" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>{f.description}</p>
                        </div>
                      </div>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {f.details.map(d => (
                          <li key={d} className="text-xs flex items-center gap-1.5" style={{ color: "color-mix(in oklch, var(--turquoise) 80%, var(--foreground))" }}>
                            <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "var(--turquoise)" }} />{d}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between pt-3 border-t mt-auto" style={{ borderColor: "color-mix(in oklch, var(--turquoise) 10%, transparent)" }}>
                        <span className="text-sm font-bold" style={{ color: "var(--gold-premium)" }}>{f.price}</span>
                        <button onClick={() => openWithPreset({ type_trajet: f.title })}
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105"
                          style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                          Demander
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </ScrollAnimation>
                );
              })}
            </div>
          </>
        )}

        {/* ── Flotte ────────────────────────────────────────────────────────── */}
        <ScrollAnimation animation="fadeInUp" delay={100}>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--turquoise)" }}>Notre flotte</span>
              <div className="flex-1 h-px" style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)" }} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {FLEET.map((v, i) => (
                <ScrollAnimation key={v.type} animation="scaleIn" delay={i * 80}>
                  <button onClick={() => openWithPreset({ type_vehicule: v.type })}
                    className="w-full rounded-2xl p-6 text-center group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                    style={{ background: "color-mix(in oklch, var(--background) 85%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 12%, transparent)" }}>
                    <div className="text-4xl mb-3">{v.icon}</div>
                    <div className="font-bold group-hover:text-[--turquoise] transition-colors">{v.type}</div>
                    <div className="text-xs mt-1 font-semibold" style={{ color: "var(--turquoise)" }}>{v.capacity}</div>
                    <div className="text-xs mt-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>{v.desc}</div>
                    <div className="mt-3 text-[10px] font-semibold rounded-full px-2.5 py-1 inline-block"
                      style={{ background: "color-mix(in oklch, var(--turquoise) 10%, transparent)", color: "var(--turquoise)" }}>
                      Réserver →
                    </div>
                  </button>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </ScrollAnimation>

        {/* ── Garanties ─────────────────────────────────────────────────────── */}
        <ScrollAnimation animation="fadeInUp" delay={100}>
          <div className="rounded-2xl p-6 grid md:grid-cols-3 gap-4 mb-12"
            style={{ background: "color-mix(in oklch, var(--turquoise) 6%, var(--background))", border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)" }}>
            {[
              { icon: Shield, title: "Chauffeurs vérifiés",  desc: "Permis, casier judiciaire, formation service client" },
              { icon: Clock,  title: "Ponctualité garantie", desc: "Suivi en temps réel et rappel 30 min avant" },
              { icon: Phone,  title: "Assistance 24h",       desc: "Joignable en permanence pendant votre séjour" },
            ].map((g, i) => (
              <div key={i} className="flex items-start gap-3">
                <g.icon size={20} strokeWidth={1.8} style={{ color: "var(--turquoise)" }} />
                <div>
                  <div className="font-semibold text-sm">{g.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <ScrollAnimation animation="fadeInUp" delay={200}>
          <div className="rounded-2xl overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, color-mix(in oklch, var(--turquoise) 10%, var(--background)), color-mix(in oklch, var(--gold-premium) 6%, var(--background)))",
              border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)",
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 80% 50%, color-mix(in oklch, var(--turquoise) 8%, transparent) 0%, transparent 60%)" }} />
            <div className="relative px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <div className="text-4xl mb-3">🚗</div>
                <h3 className="font-bold text-xl mb-2">Besoin d&apos;un transport sur-mesure ?</h3>
                <p className="text-sm max-w-md" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                  Groupe, événement, circuit multi-villes — décrivez vos besoins et recevez un devis en moins de 2h.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 items-center md:items-end shrink-0">
                <button onClick={() => openWithPreset()}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                  <Car size={15} /> Demander un devis
                </button>
                <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Bonjour AfriNomade ! Je souhaite organiser un transport sur-mesure.")}`}
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
