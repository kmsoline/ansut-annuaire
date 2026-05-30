"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useWhatsApp } from "../../components/WhatsAppNumber";
import Link from "next/link";
import {
  User, MapPin, Home, PartyPopper, Car, BadgeDollarSign, ClipboardList,
  Check, ChevronRight, Users, Calendar, CheckCircle,
} from "lucide-react";
import ScrollAnimation from "../../components/ScrollAnimation";
import { PAYS_DESTINATIONS } from "@/lib/afrinomade-types";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  // Étape 1
  nom: string; prenom: string; email: string; telephone: string; pays_residence: string;
  // Étape 2
  pays_destination: string; villes: string[]; type_service: string;
  date_depart: string; date_retour: string; nb_adultes: number; nb_enfants: number; ages_enfants: string;
  // Étape 3
  type_hebergement: string; preference_localisation: string[]; nb_chambres: number; equipements: string[];
  repas: string; // plan de repas souhaité
  // Étape 4
  activites: string[];
  // Étape 5
  type_vehicule: string; type_chauffeur: string; langue_guide: string;
  // Étape 6
  budget: string; besoins_particuliers: string; commentaire: string;
}

const INIT: FormData = {
  nom: "", prenom: "", email: "", telephone: "", pays_residence: "",
  pays_destination: "", villes: [], type_service: "",
  date_depart: "", date_retour: "", nb_adultes: 1, nb_enfants: 0, ages_enfants: "",
  type_hebergement: "", preference_localisation: [], nb_chambres: 1, equipements: [],
  repas: "",
  activites: [],
  type_vehicule: "", type_chauffeur: "", langue_guide: "",
  budget: "", besoins_particuliers: "", commentaire: "",
};

// ── Composants UI réutilisables ───────────────────────────────────────────────
function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 border"
      style={{
        background: active ? "var(--turquoise)" : "transparent",
        borderColor: active ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 20%, transparent)",
        color: active ? "white" : "color-mix(in oklch, var(--foreground) 70%, transparent)",
      }}
    >{label}</button>
  );
}

function MultiChip({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button key={o} type="button"
            onClick={() => onChange(on ? selected.filter((x) => x !== o) : [...selected, o])}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
            style={{
              background: on ? "color-mix(in oklch, var(--turquoise) 20%, transparent)" : "color-mix(in oklch, var(--background) 60%, transparent)",
              border: on ? "1.5px solid var(--turquoise)" : "1px solid color-mix(in oklch, var(--foreground) 15%, transparent)",
              color: on ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
            }}
          >{on ? <Check size={11} strokeWidth={3} className="inline mr-0.5" /> : null}{o}</button>
        );
      })}
    </div>
  );
}

function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all"
        style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 30%, transparent)", color: "var(--turquoise)" }}>−</button>
      <span className="text-base font-bold w-6 text-center">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all"
        style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 30%, transparent)", color: "var(--turquoise)" }}>+</button>
    </div>
  );
}

function Input({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
        {label}{required && <span style={{ color: "var(--turquoise)" }}> *</span>}
      </label>
      <input {...props} required={required}
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
        style={{ background: "color-mix(in oklch, var(--background) 60%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 15%, transparent)" }} />
    </div>
  );
}

// ── Fallbacks (utilisés quand le catalogue ne couvre pas encore le pays) ──────
const ACTIVITES_GENERIQUES = [
  "Plage & Détente", "Safari / Réserves", "Culture & Histoire",
  "Gastronomie", "Shopping & Marchés", "Nightlife",
  "Excursions pirogue", "Surf / Sports nautiques", "Bien-être / Spa",
  "Randonnée", "Photographie",
];
const HEBERGEMENT_GENERIQUES = [
  "Hôtel standard", "Hôtel 3-4★", "Hôtel 5★",
  "Résidence meublée", "Villa privée", "Maison d'hôte", "Éco-lodge",
];
const GUIDE_GENERIQUES = ["Français", "Anglais", "Français + Anglais", "Pas besoin de guide"];
const REPAS_GENERIQUES   = [
  "Petit-déjeuner", "Demi-pension", "Pension complète", "Repas non inclus",
];

// ── Étapes ────────────────────────────────────────────────────────────────────
const STEPS = ["Coordonnées", "Destination", "Hébergement", "Activités", "Transport", "Budget", "Récapitulatif"];

export default function ReservationPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INIT);
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitMode,  setSubmitMode]  = useState<"system" | "whatsapp" | null>(null);
  const [demandId,    setDemandId]    = useState<string | null>(null);
  const afriWA = useWhatsApp("afri");

  const set = useCallback((field: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Options dynamiques chargées depuis le catalogue selon la destination ─────
  const [activitesDispo,   setActivitesDispo]   = useState<string[]>(ACTIVITES_GENERIQUES);
  const [hebergementDispo, setHebergementDispo] = useState<string[]>(HEBERGEMENT_GENERIQUES);
  const [guideDispo,       setGuideDispo]       = useState<string[]>(GUIDE_GENERIQUES);
  const [repasDispo,       setRepasDispo]       = useState<string[]>(REPAS_GENERIQUES);
  const [catalogueSource,  setCatalogueSource]  = useState<"catalogue" | "generique">("generique");
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);

  useEffect(() => {
    const pays = form.pays_destination;
    if (!pays) {
      setActivitesDispo(ACTIVITES_GENERIQUES);
      setHebergementDispo(HEBERGEMENT_GENERIQUES);
      setGuideDispo(GUIDE_GENERIQUES);
      setRepasDispo(REPAS_GENERIQUES);
      setCatalogueSource("generique");
      return;
    }

    let cancelled = false;
    setLoadingCatalogue(true);

    const base = `/api/afrinomade/catalogue-public?pays=${encodeURIComponent(pays)}`;
    Promise.all([
      fetch(`${base}&categorie=activites`).then(r => r.ok ? r.json() : []),
      fetch(`${base}&categorie=hebergement`).then(r => r.ok ? r.json() : []),
      fetch(`${base}&categorie=guide`).then(r => r.ok ? r.json() : []),
      fetch(`${base}&categorie=repas`).then(r => r.ok ? r.json() : []),
    ])
      .then(([activites, hebergements, guides, repas]: [{ label: string }[], { label: string }[], { label: string }[], { label: string }[]]) => {
        if (cancelled) return;
        const fromCat = activites.length > 0 || hebergements.length > 0;

        setActivitesDispo(activites.length > 0
          ? activites.map(i => i.label)
          : ACTIVITES_GENERIQUES);

        // Hébergement : toujours ajouter "Pas de préférence" en fin de liste
        const hebergLabels = hebergements.length > 0
          ? [...hebergements.map(i => i.label), "Pas de préférence"]
          : [...HEBERGEMENT_GENERIQUES, "Pas de préférence"];
        setHebergementDispo(hebergLabels);

        // Guide : ajouter "Pas besoin de guide" en fin
        const guideLabels = guides.length > 0
          ? [...guides.map(i => i.label), "Pas besoin de guide"]
          : GUIDE_GENERIQUES;
        setGuideDispo(guideLabels);

        setRepasDispo(repas.length > 0
          ? [...repas.map(i => i.label), "Repas non inclus"]
          : REPAS_GENERIQUES);

        setCatalogueSource(fromCat ? "catalogue" : "generique");

        // Réinitialiser les choix dépendants du pays
        setForm(prev => ({
          ...prev,
          activites: [],
          type_hebergement: hebergLabels.includes(prev.type_hebergement) ? prev.type_hebergement : "",
          langue_guide:     guideLabels.includes(prev.langue_guide)      ? prev.langue_guide     : "",
          repas: "",
        }));
      })
      .catch(() => {
        if (!cancelled) {
          setActivitesDispo(ACTIVITES_GENERIQUES);
          setHebergementDispo([...HEBERGEMENT_GENERIQUES, "Pas de préférence"]);
          setGuideDispo(GUIDE_GENERIQUES);
          setRepasDispo(REPAS_GENERIQUES);
          setCatalogueSource("generique");
        }
      })
      .finally(() => { if (!cancelled) setLoadingCatalogue(false); });

    return () => { cancelled = true; };
  }, [form.pays_destination]); // eslint-disable-line react-hooks/exhaustive-deps

  const nb_nuits = useMemo(() => {
    if (!form.date_depart || !form.date_retour) return 0;
    const d = new Date(form.date_depart), r = new Date(form.date_retour);
    return Math.max(0, Math.round((r.getTime() - d.getTime()) / 86400000));
  }, [form.date_depart, form.date_retour]);

  const villes = useMemo(
    () => form.pays_destination ? (PAYS_DESTINATIONS[form.pays_destination]?.villes ?? []) : [],
    [form.pays_destination]
  );

  const whatsappMsg = useMemo(() => {
    const lines = [
      "Bonjour AfriNomade 🌍",
      "",
      "*Demande de voyage*",
      `👤 ${form.prenom} ${form.nom} — ${form.telephone}`,
      form.pays_destination ? `📍 Destination : ${form.pays_destination}${form.villes.length ? ` / ${form.villes.join(', ')}` : ''}` : '',
      form.type_service ? `🎯 Séjour : ${form.type_service}` : '',
      form.date_depart ? `📅 ${form.date_depart} → ${form.date_retour}${nb_nuits ? ` (${nb_nuits} nuits)` : ''}` : '',
      `👥 ${form.nb_adultes} adulte(s), ${form.nb_enfants} enfant(s)`,
      form.type_hebergement ? `🏠 Hébergement : ${form.type_hebergement} · ${form.nb_chambres} chambre(s)${form.repas ? ` · ${form.repas}` : ''}` : '',
      form.activites.length ? `🎉 Activités : ${form.activites.join(', ')}` : '',
      form.type_vehicule ? `🚗 Transport : ${form.type_vehicule}` : '',
      form.budget ? `💰 Budget : ${form.budget}` : '',
      form.besoins_particuliers ? `\n📝 ${form.besoins_particuliers}` : '',
    ].filter(Boolean).join('\n');
    return `https://wa.me/${afriWA}?text=${encodeURIComponent(lines)}`;
  }, [form, nb_nuits, afriWA]);

  // ── Envoyer via le système (enregistré en base, suivi admin) ──────────────
  const handleSubmitSystem = async () => {
    setLoading(true);
    setSubmitMode("system");
    try {
      const payload = { ...form, nb_nuits, source: 'site' };
      const res = await fetch('/api/afrinomade/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setDemandId(data.id ?? data.reference ?? null);
        setSubmitted(true);
      } else {
        alert("Une erreur est survenue. Veuillez réessayer ou envoyer via WhatsApp.");
      }
    } catch {
      alert("Erreur réseau. Veuillez réessayer ou envoyer via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  // ── Envoyer via WhatsApp (saisie manuelle dans l'admin) ───────────────────
  const handleSubmitWhatsApp = async () => {
    setLoading(true);
    setSubmitMode("whatsapp");
    try {
      // On enregistre quand même en base avec source=whatsapp pour traçabilité
      const payload = { ...form, nb_nuits, source: 'whatsapp' };
      const res = await fetch('/api/afrinomade/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);
      if (res?.ok) {
        const data = await res.json().catch(() => ({}));
        setDemandId(data.id ?? null);
      }
    } finally {
      setLoading(false);
      setSubmitted(true);
      window.open(whatsappMsg, '_blank');
    }
  };

  if (submitted) {
    const isWhatsApp = submitMode === "whatsapp";
    return (
      <main className="container py-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle size={72} style={{ color: "var(--turquoise)" }} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {isWhatsApp ? "WhatsApp ouvert !" : "Demande enregistrée !"}
          </h2>
          <p className="text-sm mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
            {isWhatsApp
              ? "Votre message WhatsApp est prêt. Notre équipe le traitera et saisira votre demande dans notre système."
              : "Votre demande a été enregistrée dans notre système. Notre équipe vous contacte sous 24h pour établir votre cotation personnalisée."}
          </p>
          {demandId && (
            <div className="inline-block mt-2 mb-6 px-4 py-2 rounded-xl text-xs font-mono"
              style={{ background: "color-mix(in oklch, var(--turquoise) 10%, transparent)", color: "var(--turquoise)", border: "1px solid color-mix(in oklch, var(--turquoise) 25%, transparent)" }}>
              Réf. : {demandId}
            </div>
          )}
          {/* Rappel du message WhatsApp si envoi via WA */}
          {isWhatsApp && (
            <button onClick={() => window.open(whatsappMsg, '_blank')}
              className="flex items-center gap-2 mx-auto mb-6 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: "#25D366" }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.534 5.857L.046 23.953l6.214-1.492A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.366l-.359-.214-3.722.894.919-3.619-.234-.373A9.818 9.818 0 1112 21.818z"/></svg>
              Ré-ouvrir WhatsApp
            </button>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => { setSubmitted(false); setStep(0); setForm(INIT); setSubmitMode(null); setDemandId(null); }}
              className="rounded-full px-6 py-3 text-sm font-semibold transition-all hover:scale-105"
              style={{ border: "1.5px solid var(--turquoise)", color: "var(--turquoise)" }}>
              Nouvelle demande
            </button>
            <Link href="/afrinomade"
              className="rounded-full px-6 py-3 text-sm font-semibold text-white text-center transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
              Retour AfriNomade
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-12">
      {/* Titre */}
      <ScrollAnimation animation="fadeInUp" delay={0}>
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--turquoise)" }}>AfriNomade</span>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold">Planifiez votre séjour</h1>
          <p className="mt-2 text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
            {STEPS.length - 1} étapes · Réponse sous 24h
          </p>
        </div>
      </ScrollAnimation>

      {/* Barre de progression */}
      <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: i < step ? "var(--turquoise)" : i === step ? "linear-gradient(135deg, var(--turquoise), var(--gold-premium))" : "color-mix(in oklch, var(--foreground) 10%, transparent)",
                  color: i <= step ? "white" : "color-mix(in oklch, var(--foreground) 40%, transparent)",
                  border: i === step ? "none" : i < step ? "none" : "1px solid color-mix(in oklch, var(--foreground) 15%, transparent)",
                }}>
                {i < step ? <Check size={13} strokeWidth={2.5} /> : i + 1}
              </div>
              <span className="text-[9px] hidden md:block" style={{ color: i === step ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-6 md:w-10 h-0.5 rounded-full transition-all duration-300 mb-4 md:mb-0"
                style={{ background: i < step ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 10%, transparent)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Carte formulaire */}
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl p-6 md:p-8"
          style={{ background: "color-mix(in oklch, var(--background) 85%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)" }}>

          {/* ── Étape 1 — Coordonnées ── */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-4"><User size={18} style={{ color: "var(--turquoise)" }} strokeWidth={2} />Vos coordonnées</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Prénom" required value={form.prenom} onChange={(e) => set("prenom", e.target.value)} />
                <Input label="Nom" required value={form.nom} onChange={(e) => set("nom", e.target.value)} />
              </div>
              <Input label="Email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
              <Input label="Téléphone / WhatsApp" required placeholder="+225 07..." value={form.telephone} onChange={(e) => set("telephone", e.target.value)} />
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Pays de résidence</label>
                <select value={form.pays_residence} onChange={(e) => set("pays_residence", e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "color-mix(in oklch, var(--background) 60%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 15%, transparent)" }}>
                  <option value="">Sélectionner...</option>
                  {["Côte d'Ivoire","Sénégal","France","Ghana","Maroc","Bénin","Togo","Autre"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── Étape 2 — Destination ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-4"><MapPin size={18} style={{ color: "var(--turquoise)" }} strokeWidth={2} />Destination & Dates</h2>
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Pays de destination</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PAYS_DESTINATIONS).map(([pays, { flag }]) => (
                    <Pill key={pays} label={`${flag} ${pays}`} active={form.pays_destination === pays}
                      onClick={() => { set("pays_destination", pays); set("villes", []); }} />
                  ))}
                </div>
              </div>
              {villes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Villes & sites (multi-sélection)</p>
                  <MultiChip options={villes} selected={form.villes} onChange={(v) => set("villes", v)} />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Type de séjour</p>
                <div className="flex flex-wrap gap-2">
                  {["Excursion journée","Week-end / Court séjour","Circuit découverte","Séjour balnéaire","Voyage d'affaires","Événement / Teambuilding","Lune de miel / Romantique","Voyage en famille","Aventure & Nature"].map((t) => (
                    <Pill key={t} label={t} active={form.type_service === t} onClick={() => set("type_service", t)} />
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Date de départ" type="date" value={form.date_depart} onChange={(e) => set("date_depart", e.target.value)} />
                <div>
                  <Input label="Date de retour" type="date" value={form.date_retour} onChange={(e) => set("date_retour", e.target.value)} />
                  {nb_nuits > 0 && <p className="text-xs mt-1" style={{ color: "var(--turquoise)" }}>→ {nb_nuits} nuit{nb_nuits > 1 ? "s" : ""}</p>}
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Adultes</p>
                  <Stepper value={form.nb_adultes} onChange={(v) => set("nb_adultes", v)} min={1} />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Enfants</p>
                  <Stepper value={form.nb_enfants} onChange={(v) => set("nb_enfants", v)} min={0} />
                </div>
              </div>
              {form.nb_enfants > 0 && (
                <Input label="Âges des enfants" placeholder="ex: 5, 8, 12 ans" value={form.ages_enfants} onChange={(e) => set("ages_enfants", e.target.value)} />
              )}
            </div>
          )}

          {/* ── Étape 3 — Hébergement ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
                <Home size={18} style={{ color: "var(--turquoise)" }} strokeWidth={2} />Hébergement
              </h2>

              {/* Type d'hébergement — dynamique selon pays */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <p className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Type d'hébergement</p>
                  {catalogueSource === "catalogue" && form.pays_destination && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", color: "var(--turquoise)" }}>
                      📋 {form.pays_destination}
                    </span>
                  )}
                </div>
                {loadingCatalogue ? (
                  <div className="flex items-center gap-2 py-3"
                    style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                    <span className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                      style={{ borderColor: "color-mix(in oklch, var(--turquoise) 30%, transparent)", borderTopColor: "var(--turquoise)" }} />
                    <span className="text-xs">Chargement…</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {hebergementDispo.map((t) => (
                      <Pill key={t} label={t} active={form.type_hebergement === t} onClick={() => set("type_hebergement", t)} />
                    ))}
                  </div>
                )}
              </div>

              {/* Repas — dynamique selon pays */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <p className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Restauration souhaitée</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {repasDispo.map((r) => (
                    <Pill key={r} label={r} active={form.repas === r} onClick={() => set("repas", r)} />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Préférences de localisation</p>
                <MultiChip options={["Bord de mer","Centre-ville","Quartier calme","Zone touristique","Proche nature"]}
                  selected={form.preference_localisation} onChange={(v) => set("preference_localisation", v)} />
              </div>
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Nombre de chambres</p>
                <Stepper value={form.nb_chambres} onChange={(v) => set("nb_chambres", v)} min={1} />
              </div>
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Services & équipements souhaités</p>
                <MultiChip options={["Wi-Fi","Cuisine équipée","Piscine","Climatisation","Siège enfant","Assistance VIP aéroport","Sécurité privée","Parking"]}
                  selected={form.equipements} onChange={(v) => set("equipements", v)} />
              </div>
            </div>
          )}

          {/* ── Étape 4 — Activités ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
                <PartyPopper size={18} style={{ color: "var(--turquoise)" }} strokeWidth={2} />
                Activités souhaitées
              </h2>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                  Sélectionnez tout ce qui vous intéresse (multi-choix)
                </p>
                {form.pays_destination && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={catalogueSource === "catalogue"
                      ? { background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", color: "var(--turquoise)" }
                      : { background: "color-mix(in oklch, var(--foreground) 8%, transparent)", color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }
                    }>
                    {catalogueSource === "catalogue" ? `📋 ${form.pays_destination}` : "Général"}
                  </span>
                )}
              </div>

              {loadingCatalogue ? (
                <div className="flex items-center gap-2 py-6 justify-center"
                  style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                  <span className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: "color-mix(in oklch, var(--turquoise) 30%, transparent)", borderTopColor: "var(--turquoise)" }} />
                  <span className="text-sm">Chargement des activités…</span>
                </div>
              ) : (
                <MultiChip options={activitesDispo} selected={form.activites} onChange={(v) => set("activites", v)} />
              )}
            </div>
          )}

          {/* ── Étape 5 — Transport & Guide ── */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-4"><Car size={18} style={{ color: "var(--turquoise)" }} strokeWidth={2} />Transport & Guide</h2>
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Véhicule souhaité</p>
                <div className="flex flex-wrap gap-2">
                  {["Berline","SUV","Véhicule premium","Van familial","Minibus groupe","Pas besoin"].map((t) => (
                    <Pill key={t} label={t} active={form.type_vehicule === t} onClick={() => set("type_vehicule", t)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Chauffeur</p>
                <div className="flex flex-wrap gap-2">
                  {["Uniquement transferts aéroport","Disponibilité quotidienne","Pas besoin"].map((t) => (
                    <Pill key={t} label={t} active={form.type_chauffeur === t} onClick={() => set("type_chauffeur", t)} />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <p className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Langue du guide</p>
                  {catalogueSource === "catalogue" && form.pays_destination && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", color: "var(--turquoise)" }}>
                      📋 {form.pays_destination}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {guideDispo.map((t) => (
                    <Pill key={t} label={t} active={form.langue_guide === t} onClick={() => set("langue_guide", t)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Étape 6 — Budget ── */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-4"><BadgeDollarSign size={18} style={{ color: "var(--turquoise)" }} strokeWidth={2} />Budget & Besoins</h2>
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Budget global estimé</p>
                <div className="flex flex-wrap gap-2">
                  {["Moins de 500 000 FCFA","500 000 – 1 000 000 FCFA","1 – 2 millions FCFA","2 – 3 millions FCFA","3 – 5 millions FCFA","Plus de 5 millions FCFA","À définir ensemble"].map((b) => (
                    <Pill key={b} label={b} active={form.budget === b} onClick={() => set("budget", b)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Besoins particuliers</label>
                <textarea rows={3} placeholder="Régime alimentaire, mobilité réduite, anniversaire, surprises..." value={form.besoins_particuliers}
                  onChange={(e) => set("besoins_particuliers", e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                  style={{ background: "color-mix(in oklch, var(--background) 60%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 15%, transparent)" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Commentaire libre</label>
                <textarea rows={3} placeholder="Tout ce que vous souhaitez nous préciser..." value={form.commentaire}
                  onChange={(e) => set("commentaire", e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                  style={{ background: "color-mix(in oklch, var(--background) 60%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 15%, transparent)" }} />
              </div>
            </div>
          )}

          {/* ── Étape 7 — Récapitulatif ── */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
                <ClipboardList size={18} style={{ color: "var(--turquoise)" }} strokeWidth={2} />Récapitulatif
              </h2>
              {[
                { title: "Vous", icon: User, rows: [
                  [`${form.prenom} ${form.nom}`, form.email, form.telephone, form.pays_residence].filter(Boolean).join(" · ")
                ]},
                { title: "Destination", icon: MapPin, rows: [
                  form.pays_destination, form.villes.join(", "), form.type_service,
                  form.date_depart ? `${form.date_depart} → ${form.date_retour}${nb_nuits ? ` (${nb_nuits} nuits)` : ""}` : "",
                  `${form.nb_adultes} adulte(s), ${form.nb_enfants} enfant(s)`,
                ].filter(Boolean)},
                { title: "Hébergement", icon: Home, rows: [form.type_hebergement, form.repas, form.preference_localisation.join(", "), form.equipements.join(", "), `${form.nb_chambres} chambre(s)`].filter(Boolean)},
                { title: "Activités", icon: PartyPopper, rows: form.activites.length ? [form.activites.join(", ")] : ["Non précisé"]},
                { title: "Transport", icon: Car, rows: [form.type_vehicule, form.type_chauffeur, form.langue_guide].filter(Boolean)},
                { title: "Budget", icon: BadgeDollarSign, rows: [form.budget, form.besoins_particuliers].filter(Boolean)},
              ].map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title} className="rounded-xl p-4" style={{ background: "color-mix(in oklch, var(--background) 70%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 10%, transparent)" }}>
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-2" style={{ color: "var(--turquoise)" }}>
                      <Icon size={12} strokeWidth={2.2} /> {section.title}
                    </div>
                    {section.rows.map((row, i) => <p key={i} className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 75%, transparent)" }}>{row}</p>)}
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: "color-mix(in oklch, var(--turquoise) 10%, transparent)" }}>
            <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-30"
              style={{ border: "1.5px solid color-mix(in oklch, var(--turquoise) 40%, transparent)", color: "var(--turquoise)" }}>
              ← Précédent
            </button>

            {step < 6 ? (
              <button type="button" onClick={() => setStep((s) => Math.min(6, s + 1))}
                className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                Suivant →
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Envoyer dans le système */}
                <button type="button" onClick={handleSubmitSystem} disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 60%, var(--royal-blue)))" }}>
                  {loading && submitMode === "system"
                    ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                  {loading && submitMode === "system" ? "Envoi..." : "Envoyer ma demande"}
                </button>
                {/* Envoyer via WhatsApp */}
                <button type="button" onClick={handleSubmitWhatsApp} disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: "#25D366" }}>
                  {loading && submitMode === "whatsapp"
                    ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.534 5.857L.046 23.953l6.214-1.492A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.366l-.359-.214-3.722.894.919-3.619-.234-.373A9.818 9.818 0 1112 21.818z"/></svg>}
                  {loading && submitMode === "whatsapp" ? "Ouverture..." : "Via WhatsApp"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
