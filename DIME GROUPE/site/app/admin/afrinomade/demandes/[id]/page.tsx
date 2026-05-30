"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Trash2, BadgeDollarSign, MapPin, Home,
  PartyPopper, Sun, CloudRain, Zap, Plus, Save, MessageCircle,
  Download, Info, Route, BarChart3, Calendar, TrendingUp, AlertTriangle,
  CheckCircle2, Lock,
} from "lucide-react";
import {
  STATUT_LABELS, STATUT_COLORS, calcPrixClient,
  type AfriNomadeDemande, type LigneCotation, type AfriNomadeCatalogue,
  type StatutDemande, type JourItineraire, type FormuleCotation,
} from "@/lib/afrinomade-types";

const STATUTS: StatutDemande[] = ["nouveau", "en_cours", "cote", "confirme", "annule"];
const MARGE_DEFAULT = 0.15;
function fmt(n: number) { return n.toLocaleString("fr-FR") + " FCFA"; }

// ── Composant tableau de lignes de cotation ─────────────────────────────────
function LignesTable({
  lignes,
  onChange,
  accentColor = "var(--turquoise)",
}: {
  lignes: LigneCotation[];
  onChange: (l: LigneCotation[]) => void;
  accentColor?: string;
}) {
  const update = (idx: number, field: keyof LigneCotation, value: number | string) => {
    const next = [...lignes];
    const l = { ...next[idx], [field]: value } as LigneCotation;
    if (field === "cout_reel" || field === "quantite" || field === "marge_pct") {
      const mrgPct = (field === "marge_pct" ? Number(value) : l.marge_pct) / 100;
      const cout   = field === "cout_reel" ? Number(value) : l.cout_reel;
      const qte    = field === "quantite"  ? Number(value) : l.quantite;
      l.prix_client    = calcPrixClient(cout, mrgPct);
      l.total_cout     = cout * qte;
      l.total_facture  = l.prix_client * qte;
    }
    next[idx] = l;
    onChange(next);
  };
  const remove = (idx: number) => onChange(lignes.filter((_, j) => j !== idx));

  if (lignes.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl text-sm"
        style={{
          border: `1px dashed color-mix(in oklch, ${accentColor} 30%, transparent)`,
          color: "color-mix(in oklch, var(--foreground) 40%, transparent)",
        }}>
        Aucune ligne — Cliquez "Générer les 2 formules" ou "Ajouter une ligne"
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-x-auto"
      style={{ border: `1px solid color-mix(in oklch, ${accentColor} 20%, transparent)` }}>
      <table className="w-full text-xs min-w-[700px]">
        <thead style={{ background: `color-mix(in oklch, ${accentColor} 10%, transparent)` }}>
          <tr>
            {["Poste", "Coût réel", "Qté", "Unité", "Marge %", "Prix client", "Total facturé", "Source", ""].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold"
                style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((l, i) => (
            <tr key={l.id} className="border-t transition-colors hover:bg-white/[0.015]"
              style={{ borderColor: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
              <td className="px-3 py-2">
                <input value={l.poste}
                  onChange={(e) => update(i, "poste", e.target.value)}
                  className="bg-transparent outline-none w-full min-w-[100px] font-medium text-xs" />
              </td>
              <td className="px-3 py-2">
                <input type="number" value={l.cout_reel}
                  onChange={(e) => update(i, "cout_reel", Number(e.target.value))}
                  className="bg-transparent outline-none w-20 text-right text-xs" />
              </td>
              <td className="px-3 py-2">
                <input type="number" value={l.quantite}
                  onChange={(e) => update(i, "quantite", Number(e.target.value))}
                  className="bg-transparent outline-none w-12 text-center text-xs" />
              </td>
              <td className="px-3 py-2 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                {l.unite}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-0.5">
                  <input type="number" value={l.marge_pct}
                    onChange={(e) => update(i, "marge_pct", Number(e.target.value))}
                    className="bg-transparent outline-none w-10 text-center text-xs font-bold"
                    style={{ color: l.marge_pct >= 15 ? "var(--turquoise)" : "#EF4444" }} />
                  <span className="text-xs opacity-40">%</span>
                </div>
              </td>
              <td className="px-3 py-2 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                {l.prix_client.toLocaleString("fr-FR")}
              </td>
              <td className="px-3 py-2 text-xs font-bold" style={{ color: "var(--gold-premium)" }}>
                {l.total_facture.toLocaleString("fr-FR")}
              </td>
              <td className="px-3 py-2">
                {l.source_prix === "catalogue" ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap"
                    style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", color: "var(--turquoise)" }}>
                    📋 cat.
                  </span>
                ) : l.source_prix === "forfait" ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap"
                    style={{ background: "color-mix(in oklch, #f59e0b 12%, transparent)", color: "#f59e0b" }}>
                    ⚠ forfait
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2">
                <button onClick={() => remove(i)}
                  className="text-red-400 hover:text-red-300 transition-colors p-0.5 rounded">
                  <Trash2 size={12} strokeWidth={2} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function AdminDemandePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [d,           setD]           = useState<AfriNomadeDemande | null>(null);
  const [catalogue,   setCatalogue]   = useState<AfriNomadeCatalogue[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState("");
  const [marge,       setMarge]       = useState(MARGE_DEFAULT);
  const [hauteSaison, setHauteSaison] = useState(false);

  // Multi-formules
  const [lignesStandard, setLignesStandard] = useState<LigneCotation[]>([]);
  const [lignesPremium,  setLignesPremium]  = useState<LigneCotation[]>([]);
  const [formuleActive,  setFormuleActive]  = useState<"standard" | "premium">("standard");
  const [formuleChoisie, setFormuleChoisie] = useState<string>("");

  // Itinéraire
  const [itineraire, setItineraire] = useState<JourItineraire[]>([]);

  // Onglets principaux
  const [tab, setTab] = useState<"infos" | "itineraire" | "cotation" | "comparatif" | "marge">("infos");

  const load = useCallback(async () => {
    const [dr, cr] = await Promise.all([
      fetch(`/api/admin/afrinomade/demandes/${id}`),
      fetch("/api/admin/afrinomade/catalogue"),
    ]);
    if (dr.ok) {
      const data: AfriNomadeDemande = await dr.json();
      setD(data);

      // Charger les formules (multi-formule)
      if (data.formules) {
        const raw = typeof data.formules === "string" ? JSON.parse(data.formules) : data.formules;
        if (Array.isArray(raw) && raw.length > 0) {
          const std = raw.find((f: FormuleCotation) => f.id === "standard");
          const prm = raw.find((f: FormuleCotation) => f.id === "premium");
          if (std) setLignesStandard(Array.isArray(std.lignes) ? std.lignes : []);
          if (prm) setLignesPremium(Array.isArray(prm.lignes) ? prm.lignes : []);
        }
      } else if (data.cotation) {
        // Rétro-compat : ancienne cotation → Standard
        const raw = typeof data.cotation === "string" ? JSON.parse(data.cotation) : data.cotation;
        if (Array.isArray(raw)) setLignesStandard(raw);
      }

      // Itinéraire
      if (data.itineraire) {
        const raw = typeof data.itineraire === "string" ? JSON.parse(data.itineraire) : data.itineraire;
        if (Array.isArray(raw)) setItineraire(raw);
      }

      if (data.formule_choisie) setFormuleChoisie(data.formule_choisie);
    }
    if (cr.ok) setCatalogue(await cr.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Recalcul instantané quand la marge globale change ───────────────────
  const isFirstMargeRender = useRef(true);
  useEffect(() => {
    if (isFirstMargeRender.current) {
      isFirstMargeRender.current = false;
      return;
    }
    const recalc = (lignes: LigneCotation[]): LigneCotation[] =>
      lignes.map((l) => {
        const px = calcPrixClient(l.cout_reel, marge);
        return {
          ...l,
          marge_pct:     Math.round(marge * 100),
          prix_client:   px,
          total_cout:    l.cout_reel * l.quantite,
          total_facture: px * l.quantite,
        };
      });
    setLignesStandard((prev) => recalc(prev));
    setLignesPremium((prev)  => recalc(prev));
  }, [marge]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mise à jour statut ───────────────────────────────────────────────────
  const updateStatut = async (statut: StatutDemande) => {
    setSaving(true);
    await fetch(`/api/admin/afrinomade/demandes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    setD((prev) => prev ? { ...prev, statut } : prev);
    setSaving(false);
    setMsg("Statut mis à jour !");
    setTimeout(() => setMsg(""), 2000);
  };

  // ── Normalisation du nom de pays pour la recherche catalogue ────────────
  // Le catalogue stocke "CI" mais le formulaire envoie "Côte d'Ivoire", etc.
  const PAYS_CATALOGUE: Record<string, string> = {
    "Côte d'Ivoire":  "CI",
    "Cote d'Ivoire":  "CI",
    "Sénégal":        "Sénégal",
    "Senegal":        "Sénégal",
    "Ghana":          "Ghana",
    "Maroc":          "Maroc",
    "Bénin":          "Bénin/Togo",
    "Togo":           "Bénin/Togo",
  };

  // ── Prix de fallback quand le catalogue ne contient pas l'entrée ────────
  const HEBERGEMENT_FALLBACK: Record<string, number> = {
    "Hôtel standard":            35_000,
    "Hôtel 3-4★":                45_000,
    "Hôtel 5★":                 120_000,
    "Résidence meublée":         30_000,
    "Villa privée":              75_000,
    "Maison d'hôte":             15_000,
    "Éco-lodge":                 20_000,
    // compatibilité anciens libellés
    "Hôtel économique":          18_000,
    "Hôtel 3 étoiles":           45_000,
    "Hôtel de luxe":             80_000,
    "Resort bord de mer":        65_000,
    "Resort tout compris":       85_000,
    "Lodge safari":              95_000,
    "Riad":                      55_000,
    "Gîte / Maison hôtes":      25_000,
    "Chambre chez l'habitant":   15_000,
  };
  const TRANSPORT_FALLBACK: Record<string, number> = {
    // libellés du formulaire (correspondance directe)
    "Berline":                   55_000,
    "SUV":                       75_000,
    "Véhicule premium":         120_000,
    "Van familial":              85_000,
    "Minibus groupe":            85_000,
    // anciens libellés
    "Voiture de location":       30_000,
    "Berline confort":           40_000,
    "SUV / 4x4":                 55_000,
    "4x4 + chauffeur":           60_000,
    "Minibus familial":          45_000,
    "Minibus 9 places":          50_000,
    "Bus touristique":           75_000,
    "Moto-taxi / Zem":            5_000,
  };
  const GUIDE_FALLBACK: Record<string, number> = {
    "Français":                  22_000,
    "Anglais":                   25_000,
    "Français + Anglais":        32_000,
    "Arabe":                     25_000,
    "Wolof":                     18_000,
  };
  // Activités génériques du formulaire → prix catalogue par personne
  // (le catalogue liste des activités spécifiques, le formulaire des catégories)
  const ACTIVITES_FORFAIT: Record<string, number> = {
    "Plage & Détente":           8_000,
    "Safari / Réserves":        15_000,
    "Culture & Histoire":       10_000,
    "Gastronomie":               8_000,
    "Shopping & Marchés":        5_000,
    "Nightlife":                12_000,
    "Excursions pirogue":       15_000,
    "Surf / Sports nautiques":  20_000,
    "Bien-être / Spa":          70_000,
    "Randonnée":                10_000,
    "Photographie":              8_000,
  };

  // ── Génération automatique des lignes ────────────────────────────────────
  // cat = catalogue fraîchement chargé (passé en param pour éviter la closure stale)
  const buildLignes = (premium: boolean, cat: AfriNomadeCatalogue[]): LigneCotation[] => {
    if (!d) return [];
    const nuits     = d.nb_nuits    ?? 1;
    const adultes   = d.nb_adultes  ?? 1;
    const enfants   = d.nb_enfants  ?? 0;
    const voyageurs = adultes + enfants;
    const chambres  = d.nb_chambres ?? 1;
    const jours     = Math.max(1, nuits);
    const newLignes: LigneCotation[] = [];
    let idx = 0;

    // Pays normalisé pour la recherche dans le catalogue
    const paysCat = PAYS_CATALOGUE[d.pays_destination ?? ""] ?? d.pays_destination;

    const add = (
      poste: string, desc: string, cout: number, qte: number, unite: string,
      source: LigneCotation["source_prix"] = "forfait",
    ) => {
      if (cout <= 0) return;
      const px = calcPrixClient(cout, marge);
      newLignes.push({
        id: String(idx++), poste, description: desc,
        cout_reel: cout, quantite: qte, unite,
        prix_client: px,
        total_cout:    cout * qte,
        total_facture: px * qte,
        marge_pct: Math.round(marge * 100),
        source_prix: source,
      });
    };

    // ── Hébergement ──
    if (d.type_hebergement) {
      const entry = cat.find(
        (c) => c.categorie === "hebergement" && c.pays === paysCat && c.label === d.type_hebergement
      );
      const pxCat = entry ? (hauteSaison ? entry.prix_haute_saison : entry.prix_basse_saison) : undefined;
      const pxFallback = HEBERGEMENT_FALLBACK[d.type_hebergement] ?? 40_000;
      const pxBase = pxCat ?? pxFallback;
      const mult = premium ? 1.35 : 1;
      add(
        "Hébergement",
        `${d.type_hebergement} × ${chambres} ch. × ${nuits} nuit(s)${premium ? " (Sup. Premium)" : ""}`,
        Math.round(pxBase * mult), chambres * nuits, "nuit",
        entry ? "catalogue" : "forfait",
      );
    }

    // ── Transport ──
    if (d.type_vehicule && d.type_vehicule !== "Pas besoin") {
      const labelCat = d.type_vehicule === "Minibus groupe" ? "Minibus" : d.type_vehicule;
      // Chercher d'abord par pays puis en fallback sans filtre pays
      const entry = cat.find((c) => c.categorie === "transport" && c.label === labelCat && c.pays === paysCat)
        ?? cat.find((c) => c.categorie === "transport" && c.label === labelCat);
      const pxCat = entry?.prix_journee;
      const pxFallback = TRANSPORT_FALLBACK[d.type_vehicule] ?? 40_000;
      const pxBase = pxCat ?? pxFallback;
      const mult = premium ? 1.3 : 1;
      add(
        "Transport",
        `${d.type_vehicule} × ${jours} jour(s)${premium ? " (Classe Affaires)" : ""}`,
        Math.round(pxBase * mult), jours, "jour",
        entry ? "catalogue" : "forfait",
      );
    }

    // ── Chauffeur ──
    if (d.type_chauffeur && d.type_chauffeur !== "Sans chauffeur" && d.type_chauffeur !== "Avec chauffeur inclus") {
      const entry = cat.find((c) => c.categorie === "transport" && c.label.toLowerCase().includes("chauffeur") && c.pays === paysCat)
        ?? cat.find((c) => c.categorie === "transport" && c.label.toLowerCase().includes("chauffeur"));
      add("Chauffeur", `${d.type_chauffeur} × ${jours} jour(s)`,
        entry?.prix_journee ?? 18_000, jours, "jour",
        entry ? "catalogue" : "forfait",
      );
    }

    // ── Guide ──
    if (d.langue_guide && d.langue_guide !== "Pas besoin de guide") {
      const label = d.langue_guide.includes("+") ? "Français + Anglais" : d.langue_guide;
      // Chercher d'abord par pays puis en fallback sans filtre pays
      const entry = cat.find((c) => c.categorie === "guide" && c.label === label && c.pays === paysCat)
        ?? cat.find((c) => c.categorie === "guide" && c.label === label);
      const pxBase = entry?.prix_journee ?? GUIDE_FALLBACK[label] ?? 22_000;
      add("Guide", `Guide ${label} × ${jours} jour(s)`, pxBase, jours, "jour",
        entry ? "catalogue" : "forfait",
      );
    }

    // ── Activités ──
    // Le formulaire envoie des catégories génériques ("Safari / Réserves", "Bien-être / Spa"…)
    // On cherche dans le catalogue par mot-clé, sinon on utilise ACTIVITES_FORFAIT.
    d.activites?.forEach((act) => {
      const actLow = act.toLowerCase();
      const entry = cat.find(
        (c) => c.categorie === "activites" &&
          (!c.pays || c.pays === paysCat) &&
          c.label.toLowerCase().split(/[\s/,+&-]/).some((word) => word.length > 3 && actLow.includes(word))
      );
      const pxBase = entry?.prix_par_personne ?? ACTIVITES_FORFAIT[act] ?? 12_000;
      add("Activité", `${act} × ${voyageurs} pers.`, pxBase, voyageurs, "pers.",
        entry ? "catalogue" : "forfait",
      );
    });

    // ── Repas ──
    if (d.equipements?.some((e) => e.toLowerCase().includes("repas") || e.toLowerCase().includes("pension"))) {
      const entry = cat.find((c) => c.categorie === "repas");
      add("Repas / Pension", `Demi-pension × ${voyageurs} pers. × ${nuits} nuit(s)`,
        entry?.prix_par_personne ?? 8_000, voyageurs * nuits, "repas",
        entry ? "catalogue" : "forfait",
      );
    }

    // ── Premium extras ──
    if (premium) {
      add("Accueil VIP",      "Accueil aéroport + bouquet · service Premium", 15_000, 1, "forfait", "forfait");
      add("Conciergerie 24h", "Service Premium tout séjour",                    8_000, 1, "forfait", "forfait");
    }

    return newLignes;
  };

  const [generating, setGenerating] = useState(false);

  const genererFormules = async () => {
    if (!d) return;
    setGenerating(true);
    // Toujours rafraîchir le catalogue depuis la BDD avant de générer
    let freshCat = catalogue;
    try {
      const res = await fetch("/api/admin/afrinomade/catalogue");
      if (res.ok) {
        freshCat = await res.json();
        setCatalogue(freshCat);
      }
    } catch { /* conserver le catalogue déjà chargé */ }
    setLignesStandard(buildLignes(false, freshCat));
    setLignesPremium(buildLignes(true,  freshCat));
    setGenerating(false);
    setTab("cotation");
  };

  // ── Génération itinéraire ─────────────────────────────────────────────────
  const genererItineraire = () => {
    if (!d) return;
    const nuits  = d.nb_nuits ?? 7;
    const jours  = nuits + 1;
    const debut  = d.date_depart ? new Date(d.date_depart) : null;
    const villes = d.villes?.length ? d.villes : [d.pays_destination ?? ""];

    const rows: JourItineraire[] = Array.from({ length: jours }, (_, i) => {
      const day = debut ? new Date(debut.getTime() + i * 86_400_000) : null;
      const ds  = day ? day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) : "";
      const ville = villes[Math.min(i, villes.length - 1)] ?? "";
      return {
        jour:        `J${i + 1}${ds ? ` (${ds})` : ""}`,
        ville,
        programme:   i === 0        ? "Accueil aéroport — Transfert — Installation"
                   : i === jours - 1 ? "Petit-déjeuner — Transfert aéroport — Départ"
                   : "Programme à définir",
        hebergement: i < jours - 1 ? (d.type_hebergement ?? "") : "—",
        temps_route: "—",
      };
    });
    setItineraire(rows);
    setTab("itineraire");
  };

  const updateJour = (idx: number, field: keyof JourItineraire, value: string) => {
    setItineraire((prev) => prev.map((j, i) => i === idx ? { ...j, [field]: value } : j));
  };

  const addJour = () => {
    setItineraire((prev) => [
      ...prev,
      { jour: `J${prev.length + 1}`, ville: "", programme: "", hebergement: "", temps_route: "" },
    ]);
  };

  // ── Payload cotation (partagé save + aperçu) ─────────────────────────────
  const buildPayload = () => {
    const formules: FormuleCotation[] = [
      { id: "standard", nom: "⭐ Standard Confort", lignes: lignesStandard },
      { id: "premium",  nom: "👑 Premium Famille",  lignes: lignesPremium  },
    ];
    const totalStd  = lignesStandard.reduce((s, l) => s + l.total_facture, 0);
    const totalPrm  = lignesPremium.reduce ((s, l) => s + l.total_facture, 0);
    const totalRef  = formuleChoisie === "premium" ? totalPrm : totalStd;
    const voy       = (d?.nb_adultes ?? 1) + (d?.nb_enfants ?? 0);
    return {
      formules,
      cotation:            lignesStandard,
      itineraire,
      formule_choisie:     formuleChoisie || null,
      montant_total:       totalRef,
      montant_par_personne: Math.round(totalRef / voy),
      acompte:             Math.round(totalRef * 0.5),
      statut:              "cote" as const,
    };
  };

  // ── Sauvegarde cotation ────────────────────────────────────────────────────
  const saveCotation = async () => {
    if (!d) return;
    setSaving(true);
    const payload = buildPayload();
    const res = await fetch(`/api/admin/afrinomade/demandes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setD((prev) => prev ? { ...prev, ...payload } as AfriNomadeDemande : prev);
      setMsg("Cotation & itinéraire sauvegardés !");
      setTimeout(() => setMsg(""), 3000);
    }
    setSaving(false);
  };

  // ── Aperçu PDF : sauvegarde silencieuse + cache sessionStorage ──────────
  const [openingApercu, setOpeningApercu] = useState(false);
  const openApercu = async () => {
    if (!hasCotation || !d) return;
    setOpeningApercu(true);
    const payload = buildPayload();

    // 1. Tenter la sauvegarde en DB (peut échouer si colonnes manquantes)
    try {
      await fetch(`/api/admin/afrinomade/demandes/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch { /* silencieux — le cache suffit pour l'aperçu */ }

    // 2. Stocker les données dans sessionStorage pour l'aperçu (fiable)
    const apercuData = {
      ...d,
      ...payload,
      formules:      payload.formules,
      itineraire:    payload.itineraire,
      formule_choisie: payload.formule_choisie,
    };
    sessionStorage.setItem(`apercu-${id}`, JSON.stringify(apercuData));

    setOpeningApercu(false);
    window.open(`/admin/afrinomade/demandes/${id}/apercu`, "_blank");
  };

  // ── WhatsApp ────────────────────────────────────────────────────────────────
  const sendWhatsApp = () => {
    if (!d) return;
    const totalStd  = lignesStandard.reduce((s, l) => s + l.total_facture, 0);
    const totalPrm  = lignesPremium.reduce ((s, l) => s + l.total_facture, 0);
    const voyageurs = (d.nb_adultes ?? 1) + (d.nb_enfants ?? 0);
    const hasBoth   = lignesStandard.length > 0 && lignesPremium.length > 0;

    const lines: string[] = [
      `Bonjour ${d.prenom} 👋`,
      "",
      `*Votre cotation AfriNomade — ${d.pays_destination ?? ""}*`,
      d.date_depart ? `📅 ${d.date_depart} → ${d.date_retour} (${d.nb_nuits} nuits)` : "",
      `👥 ${voyageurs} voyageur(s)`,
      "",
    ];

    if (hasBoth) {
      lines.push("*⭐ FORMULE STANDARD CONFORT*");
      lignesStandard.forEach((l) => lines.push(`• ${l.poste}${l.description ? ` (${l.description})` : ""} : ${fmt(l.total_facture)}`));
      lines.push(`*➡ Total Standard : ${fmt(totalStd)}*`);
      lines.push(`Prix/pers. : ${fmt(Math.round(totalStd / voyageurs))} · Acompte 50% : ${fmt(Math.round(totalStd * 0.5))}`);
      lines.push("");
      lines.push("*👑 FORMULE PREMIUM FAMILLE*");
      lignesPremium.forEach((l) => lines.push(`• ${l.poste}${l.description ? ` (${l.description})` : ""} : ${fmt(l.total_facture)}`));
      lines.push(`*➡ Total Premium : ${fmt(totalPrm)}*`);
      lines.push(`Prix/pers. : ${fmt(Math.round(totalPrm / voyageurs))} · Acompte 50% : ${fmt(Math.round(totalPrm * 0.5))}`);
    } else {
      const ref   = lignesStandard.length > 0 ? lignesStandard : lignesPremium;
      const total = ref.reduce((s, l) => s + l.total_facture, 0);
      ref.forEach((l) => lines.push(`• ${l.poste} : ${fmt(l.total_facture)}`));
      lines.push(`*TOTAL : ${fmt(total)}*`);
      lines.push(`Prix/pers. : ${fmt(Math.round(total / voyageurs))} · Acompte 50% : ${fmt(Math.round(total * 0.5))}`);
    }

    lines.push("", "Cette cotation est valable 7 jours. Répondez ici pour confirmer. 🌍");
    const tel = d.telephone?.replace(/\s+/g, "") ?? "";
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(lines.filter((l) => l !== undefined).join("\n"))}`, "_blank");
  };

  const supprimerDemande = async () => {
    if (!confirm("Supprimer définitivement cette demande ?")) return;
    await fetch(`/api/admin/afrinomade/demandes/${id}`, { method: "DELETE" });
    router.push("/admin/afrinomade/demandes");
  };

  // ── Rendu chargement / erreur ───────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: "var(--turquoise)", borderTopColor: "transparent" }} />
    </div>
  );
  if (!d) return <div className="p-8 text-center">Demande introuvable</div>;

  // ── Calculs ─────────────────────────────────────────────────────────────
  const voyageurs   = (d.nb_adultes ?? 1) + (d.nb_enfants ?? 0);
  const totalStd    = lignesStandard.reduce((s, l) => s + l.total_facture, 0);
  const totalPrm    = lignesPremium.reduce ((s, l) => s + l.total_facture, 0);
  const totalStdCout= lignesStandard.reduce((s, l) => s + l.total_cout,    0);
  const totalPrmCout= lignesPremium.reduce ((s, l) => s + l.total_cout,    0);

  const activeLignes     = formuleActive === "standard" ? lignesStandard   : lignesPremium;
  const setActiveLignes  = formuleActive === "standard" ? setLignesStandard : setLignesPremium;
  const activeTotalCout  = formuleActive === "standard" ? totalStdCout   : totalPrmCout;
  const activeTotalFact  = formuleActive === "standard" ? totalStd       : totalPrm;
  const activeMargeGlob  = activeTotalCout > 0
    ? Math.round(((activeTotalFact - activeTotalCout) / activeTotalCout) * 100) : 0;

  const hasCotation = lignesStandard.length > 0 || lignesPremium.length > 0;

  const INFOS_SECTIONS = [
    { title: "Destination", icon: MapPin, rows: [
      ["Pays",           d.pays_destination],
      ["Villes",         d.villes?.join(", ")],
      ["Type séjour",    d.type_service],
      ["Dates",          d.date_depart ? `${d.date_depart} → ${d.date_retour} (${d.nb_nuits}n)` : undefined],
      ["Voyageurs",      `${d.nb_adultes}A + ${d.nb_enfants}E`],
      ["Pays résidence", d.pays_residence],
    ]},
    { title: "Hébergement", icon: Home, rows: [
      ["Type",        d.type_hebergement],
      ["Localisation",d.preference_localisation?.join(", ")],
      ["Chambres",    d.nb_chambres?.toString()],
      ["Équipements", d.equipements?.join(", ")],
    ]},
    { title: "Activités & Transport", icon: PartyPopper, rows: [
      ["Activités", d.activites?.join(", ")],
      ["Véhicule",  d.type_vehicule],
      ["Chauffeur", d.type_chauffeur],
      ["Guide",     d.langue_guide],
    ]},
    { title: "Budget & Notes", icon: BadgeDollarSign, rows: [
      ["Budget",      d.budget],
      ["Besoins",     d.besoins_particuliers],
      ["Commentaire", d.commentaire],
      ["Source",      d.source],
      ["Référence",   d.reference],
    ]},
  ];

  const TABS = [
    { id: "infos"      as const, label: "Infos client", icon: Info,          color: undefined       },
    { id: "itineraire" as const, label: "Itinéraire",   icon: Route,         color: undefined       },
    { id: "cotation"   as const, label: "Cotation",     icon: BadgeDollarSign, color: undefined     },
    { id: "comparatif" as const, label: "Comparatif",   icon: BarChart3,     color: undefined       },
    { id: "marge"      as const, label: "Marge",        icon: TrendingUp,    color: "#EF4444"       },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin/afrinomade/demandes"
            className="flex items-center gap-1 text-xs mb-2"
            style={{ color: "var(--turquoise)" }}>
            <ArrowLeft size={13} /> Retour aux demandes
          </Link>
          <h1 className="text-2xl font-bold">{d.prenom} {d.nom}</h1>
          <p className="text-sm mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
            {d.email} · {d.telephone}
            {d.reference && <span className="ml-2 px-2 py-0.5 rounded text-xs font-mono"
              style={{ background: "color-mix(in oklch, var(--turquoise) 12%, transparent)", color: "var(--turquoise)" }}>
              {d.reference}
            </span>}
            {d.created_at && <span className="ml-2">· {new Date(d.created_at).toLocaleDateString("fr-FR")}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUTS.map((s) => (
            <button key={s} onClick={() => updateStatut(s)} disabled={saving}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: d.statut === s ? STATUT_COLORS[s] : "transparent",
                border: `1px solid ${STATUT_COLORS[s]}`,
                color: d.statut === s ? "white" : STATUT_COLORS[s],
              }}>
              {STATUT_LABELS[s]}
            </button>
          ))}
          <button onClick={supprimerDemande}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:bg-red-500/10"
            style={{ border: "1px solid #EF4444", color: "#EF4444" }}>
            <Trash2 size={12} strokeWidth={2} /> Supprimer
          </button>
        </div>
      </div>

      {/* ── Message flash ──────────────────────────────────────────────── */}
      {msg && (
        <div className="p-3 rounded-lg text-sm text-center font-medium"
          style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", color: "var(--turquoise)" }}>
          {msg}
        </div>
      )}

      {/* ── Onglets principaux ─────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl p-1 overflow-x-auto"
        style={{ background: "color-mix(in oklch, var(--background) 60%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}>
        {TABS.map(({ id: t, label, icon: Icon, color }) => {
          const activeColor = color ?? "var(--turquoise)";
          const isActive = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all whitespace-nowrap px-3"
              style={{
                background: isActive ? activeColor : "transparent",
                color:      isActive ? "white" : color ?? "color-mix(in oklch, var(--foreground) 60%, transparent)",
                border:     !isActive && color ? `1px solid ${color}40` : "1px solid transparent",
              }}>
              <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
              {t === "marge" && !isActive && (
                <Lock size={10} strokeWidth={2} style={{ opacity: 0.6 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB INFOS
      ══════════════════════════════════════════════════════════════════ */}
      {tab === "infos" && (
        <div className="grid gap-4 md:grid-cols-2">
          {INFOS_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-xl p-5 glass">
                <div className="flex items-center gap-1.5 text-xs font-bold mb-3"
                  style={{ color: "var(--turquoise)" }}>
                  <Icon size={13} strokeWidth={2.2} />
                  {section.title}
                </div>
                <table className="w-full text-sm">
                  {section.rows.filter(([, v]) => v).map(([k, v]) => (
                    <tr key={k} className="border-b"
                      style={{ borderColor: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                      <td className="py-1.5 pr-3 text-xs"
                        style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)", width: "120px" }}>{k}</td>
                      <td className="py-1.5"
                        style={{ color: "color-mix(in oklch, var(--foreground) 85%, transparent)" }}>{v}</td>
                    </tr>
                  ))}
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB ITINÉRAIRE
      ══════════════════════════════════════════════════════════════════ */}
      {tab === "itineraire" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={genererItineraire}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, var(--turquoise), var(--gold-premium))" }}>
              <Calendar size={14} strokeWidth={2.2} /> Générer auto
            </button>
            <button onClick={addJour}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={{ border: "1px solid var(--turquoise)", color: "var(--turquoise)" }}>
              <Plus size={14} strokeWidth={2.2} /> Ajouter un jour
            </button>
            <span className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
              {itineraire.length} jour(s)
            </span>
          </div>

          {itineraire.length === 0 ? (
            <div className="text-center py-10 rounded-xl text-sm"
              style={{ border: "1px dashed color-mix(in oklch, var(--turquoise) 25%, transparent)", color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
              Aucun jour — Cliquez "Générer auto" pour créer l'itinéraire depuis les dates de la demande
            </div>
          ) : (
            <div className="rounded-xl overflow-x-auto"
              style={{ border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)" }}>
              <table className="w-full text-xs min-w-[700px]">
                <thead style={{ background: "color-mix(in oklch, var(--turquoise) 10%, transparent)" }}>
                  <tr>
                    {["Jour", "Ville", "Programme", "Hébergement", "Tps route", ""].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold"
                        style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {itineraire.map((j, i) => (
                    <tr key={i} className="border-t hover:bg-white/[0.015] transition-colors"
                      style={{ borderColor: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                      <td className="px-3 py-2">
                        <input value={j.jour}
                          onChange={(e) => updateJour(i, "jour", e.target.value)}
                          className="bg-transparent outline-none w-24 font-semibold text-xs"
                          style={{ color: "var(--turquoise)" }} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={j.ville}
                          onChange={(e) => updateJour(i, "ville", e.target.value)}
                          className="bg-transparent outline-none w-28 text-xs font-medium" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={j.programme}
                          onChange={(e) => updateJour(i, "programme", e.target.value)}
                          className="bg-transparent outline-none w-full min-w-[200px] text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={j.hebergement ?? ""}
                          onChange={(e) => updateJour(i, "hebergement", e.target.value)}
                          className="bg-transparent outline-none w-32 text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={j.temps_route ?? ""}
                          onChange={(e) => updateJour(i, "temps_route", e.target.value)}
                          className="bg-transparent outline-none w-20 text-xs text-center" />
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => setItineraire((prev) => prev.filter((_, k) => k !== i))}
                          className="text-red-400 hover:text-red-300 transition-colors p-0.5 rounded">
                          <Trash2 size={12} strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Save button from itinerary tab */}
          {itineraire.length > 0 && (
            <button onClick={saveCotation} disabled={saving}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, var(--turquoise), var(--gold-premium))" }}>
              <Save size={14} strokeWidth={2} />
              {saving ? "Sauvegarde..." : "Sauvegarder l'itinéraire"}
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB COTATION
      ══════════════════════════════════════════════════════════════════ */}
      {tab === "cotation" && (
        <div className="space-y-4">
          {/* Contrôles généraux */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Marge */}
            <div className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
              style={{ background: "color-mix(in oklch, var(--background) 70%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}>
              <span className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>Marge :</span>
              <input type="number" min={15} max={50} step={1} value={Math.round(marge * 100)}
                onChange={(e) => setMarge(Number(e.target.value) / 100)}
                className="w-14 bg-transparent outline-none text-center font-bold"
                style={{ color: "var(--gold-premium)" }} />
              <span style={{ color: "var(--gold-premium)" }} className="text-xs">%</span>
            </div>
            {/* Saison */}
            <button onClick={() => setHauteSaison(!hauteSaison)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: hauteSaison ? "color-mix(in oklch, var(--gold-premium) 20%, transparent)" : "transparent",
                border: `1px solid ${hauteSaison ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 15%, transparent)"}`,
                color: hauteSaison ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
              }}>
              {hauteSaison ? <Sun size={14} strokeWidth={2} /> : <CloudRain size={14} strokeWidth={2} />}
              {hauteSaison ? "Haute saison" : "Basse saison"}
            </button>
            {/* Générer */}
            <button onClick={genererFormules} disabled={generating}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, var(--turquoise), var(--gold-premium))" }}>
              {generating
                ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Chargement catalogue…</>
                : <><Zap size={14} strokeWidth={2.2} /> Générer les 2 formules</>
              }
            </button>
          </div>

          {/* Sous-onglets Standard / Premium */}
          <div className="flex gap-2">
            <button onClick={() => setFormuleActive("standard")}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all"
              style={{
                background: formuleActive === "standard"
                  ? "color-mix(in oklch, var(--turquoise) 15%, var(--background))"
                  : "transparent",
                border: `2px solid ${formuleActive === "standard" ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                color: formuleActive === "standard" ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
              }}>
              ⭐ Standard Confort
              {lignesStandard.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--turquoise)", color: "white" }}>
                  {lignesStandard.length}
                </span>
              )}
            </button>
            <button onClick={() => setFormuleActive("premium")}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all"
              style={{
                background: formuleActive === "premium"
                  ? "color-mix(in oklch, var(--gold-premium) 12%, var(--background))"
                  : "transparent",
                border: `2px solid ${formuleActive === "premium" ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                color: formuleActive === "premium" ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
              }}>
              👑 Premium Famille
              {lignesPremium.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--gold-premium)", color: "white" }}>
                  {lignesPremium.length}
                </span>
              )}
            </button>
          </div>

          {/* Tableau lignes */}
          <LignesTable
            lignes={activeLignes}
            onChange={(nl) => setActiveLignes(() => nl)}
            accentColor={formuleActive === "standard" ? "var(--turquoise)" : "var(--gold-premium)"}
          />

          {/* Ajouter une ligne */}
          <button
            onClick={() => {
              const ligne: LigneCotation = {
                id: String(Date.now()), poste: "Service personnalisé", description: "",
                cout_reel: 0, quantite: 1, unite: "forfait",
                prix_client: 0, total_cout: 0, total_facture: 0, marge_pct: 15, custom: true,
              };
              setActiveLignes((prev) => [...prev, ligne]);
            }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            style={{
              border: `1px solid ${formuleActive === "standard" ? "var(--turquoise)" : "var(--gold-premium)"}`,
              color:  formuleActive === "standard" ? "var(--turquoise)" : "var(--gold-premium)",
            }}>
            <Plus size={14} strokeWidth={2.2} />
            Ajouter une ligne ({formuleActive === "standard" ? "Standard" : "Premium"})
          </button>

          {/* Totaux formule active */}
          {activeLignes.length > 0 && (
            <div className="rounded-xl p-5"
              style={{
                background: `color-mix(in oklch, ${formuleActive === "standard" ? "var(--turquoise)" : "var(--gold-premium)"} 6%, var(--background))`,
                border:     `1px solid color-mix(in oklch, ${formuleActive === "standard" ? "var(--turquoise)" : "var(--gold-premium)"} 20%, transparent)`,
              }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Coût réel total</div>
                  <div className="font-bold">{fmt(activeTotalCout)}</div>
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Marge globale</div>
                  <div className="font-bold" style={{ color: activeMargeGlob >= 15 ? "var(--turquoise)" : "#EF4444" }}>{activeMargeGlob}%</div>
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Total facturé</div>
                  <div className="text-lg font-bold" style={{ color: "var(--gold-premium)" }}>{fmt(activeTotalFact)}</div>
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Par personne · Acompte 50%</div>
                  <div className="font-bold text-xs">{fmt(Math.round(activeTotalFact / voyageurs))} · {fmt(Math.round(activeTotalFact * 0.5))}</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={saveCotation} disabled={saving || !hasCotation}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, var(--turquoise), var(--gold-premium))" }}>
              <Save size={15} strokeWidth={2} />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button onClick={openApercu} disabled={!hasCotation || openingApercu}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Download size={15} strokeWidth={2} />
              {openingApercu ? "Sauvegarde..." : "Aperçu / PDF"}
            </button>
            <button onClick={sendWhatsApp} disabled={!hasCotation}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: "#25D366" }}>
              <MessageCircle size={15} strokeWidth={2} />
              WhatsApp
            </button>
            <a href={`/api/admin/afrinomade/export-excel/${id}`}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 ${!hasCotation ? "opacity-40 pointer-events-none" : ""}`}
              style={{ background: "#217346" }}>
              <Download size={15} strokeWidth={2} />
              Excel
            </a>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB COMPARATIF
      ══════════════════════════════════════════════════════════════════ */}
      {tab === "comparatif" && (
        <div className="space-y-6">
          {/* Formule choisie */}
          <div className="rounded-xl p-4 glass">
            <p className="text-xs font-bold mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
              FORMULE CHOISIE PAR LE CLIENT
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "standard", label: "⭐ Standard Confort", color: "var(--turquoise)" },
                { id: "premium",  label: "👑 Premium Famille",  color: "var(--gold-premium)" },
                { id: "",         label: "Non défini",          color: "color-mix(in oklch, var(--foreground) 35%, transparent)" },
              ].map(({ id: fid, label, color }) => (
                <button key={fid} onClick={() => setFormuleChoisie(fid)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all"
                  style={{
                    background: formuleChoisie === fid ? color : "transparent",
                    border:     `2px solid ${color}`,
                    color:      formuleChoisie === fid ? "white" : color,
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tableau comparatif côte-à-côte */}
          {(lignesStandard.length > 0 || lignesPremium.length > 0) ? (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Standard */}
              <div className="rounded-xl overflow-hidden"
                style={{ border: "2px solid color-mix(in oklch, var(--turquoise) 30%, transparent)" }}>
                <div className="px-5 py-3 flex items-center justify-between"
                  style={{ background: "color-mix(in oklch, var(--turquoise) 10%, var(--background))" }}>
                  <span className="font-bold text-sm" style={{ color: "var(--turquoise)" }}>⭐ Standard Confort</span>
                  {formuleChoisie === "standard" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "var(--turquoise)", color: "white" }}>
                      Choisie
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  {lignesStandard.length === 0 ? (
                    <p className="text-xs text-center py-4 opacity-40">Aucune ligne — générez la cotation Standard</p>
                  ) : (
                    <>
                      {lignesStandard.map((l, i) => (
                        <div key={i} className="flex justify-between text-xs py-1 border-b"
                          style={{ borderColor: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                          <span style={{ color: "color-mix(in oklch, var(--foreground) 75%, transparent)" }}>
                            {l.poste}{l.description ? ` — ${l.description}` : ""}
                          </span>
                          <span className="font-semibold ml-2 shrink-0">{l.total_facture.toLocaleString("fr-FR")}</span>
                        </div>
                      ))}
                      <div className="pt-2 space-y-1">
                        <div className="flex justify-between text-sm font-bold"
                          style={{ color: "var(--turquoise)" }}>
                          <span>TOTAL</span>
                          <span>{fmt(totalStd)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Par personne</span>
                          <span>{fmt(Math.round(totalStd / voyageurs))}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Acompte 50%</span>
                          <span>{fmt(Math.round(totalStd * 0.5))}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Marge</span>
                          <span style={{ color: totalStdCout > 0 && ((totalStd - totalStdCout) / totalStdCout) >= 0.15 ? "var(--turquoise)" : "#EF4444" }}>
                            {totalStdCout > 0 ? Math.round(((totalStd - totalStdCout) / totalStdCout) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Premium */}
              <div className="rounded-xl overflow-hidden"
                style={{ border: "2px solid color-mix(in oklch, var(--gold-premium) 30%, transparent)" }}>
                <div className="px-5 py-3 flex items-center justify-between"
                  style={{ background: "color-mix(in oklch, var(--gold-premium) 8%, var(--background))" }}>
                  <span className="font-bold text-sm" style={{ color: "var(--gold-premium)" }}>👑 Premium Famille</span>
                  {formuleChoisie === "premium" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "var(--gold-premium)", color: "white" }}>
                      Choisie
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  {lignesPremium.length === 0 ? (
                    <p className="text-xs text-center py-4 opacity-40">Aucune ligne — générez la cotation Premium</p>
                  ) : (
                    <>
                      {lignesPremium.map((l, i) => (
                        <div key={i} className="flex justify-between text-xs py-1 border-b"
                          style={{ borderColor: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                          <span style={{ color: "color-mix(in oklch, var(--foreground) 75%, transparent)" }}>
                            {l.poste}{l.description ? ` — ${l.description}` : ""}
                          </span>
                          <span className="font-semibold ml-2 shrink-0">{l.total_facture.toLocaleString("fr-FR")}</span>
                        </div>
                      ))}
                      <div className="pt-2 space-y-1">
                        <div className="flex justify-between text-sm font-bold"
                          style={{ color: "var(--gold-premium)" }}>
                          <span>TOTAL</span>
                          <span>{fmt(totalPrm)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Par personne</span>
                          <span>{fmt(Math.round(totalPrm / voyageurs))}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Acompte 50%</span>
                          <span>{fmt(Math.round(totalPrm * 0.5))}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Marge</span>
                          <span style={{ color: totalPrmCout > 0 && ((totalPrm - totalPrmCout) / totalPrmCout) >= 0.15 ? "var(--turquoise)" : "#EF4444" }}>
                            {totalPrmCout > 0 ? Math.round(((totalPrm - totalPrmCout) / totalPrmCout) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl"
              style={{ border: "1px dashed color-mix(in oklch, var(--foreground) 12%, transparent)", color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
              <BarChart3 size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune cotation générée</p>
              <p className="text-xs mt-1">Allez dans l'onglet Cotation → Générer les 2 formules</p>
            </div>
          )}

          {/* Résumé écart */}
          {totalStd > 0 && totalPrm > 0 && (
            <div className="rounded-xl p-5 text-center"
              style={{ background: "color-mix(in oklch, var(--background) 70%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
              <p className="text-xs mb-1" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Écart Standard → Premium</p>
              <p className="text-2xl font-bold" style={{ color: "var(--gold-premium)" }}>
                + {fmt(totalPrm - totalStd)}
              </p>
              <p className="text-xs mt-1" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                +{Math.round(((totalPrm - totalStd) / totalStd) * 100)}% par rapport au Standard
              </p>
            </div>
          )}

          {/* Actions depuis comparatif */}
          {hasCotation && (
            <div className="flex flex-wrap gap-3">
              <button onClick={saveCotation} disabled={saving}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, var(--turquoise), var(--gold-premium))" }}>
                <Save size={14} strokeWidth={2} />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button onClick={openApercu} disabled={!hasCotation || openingApercu}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <Download size={14} strokeWidth={2} />
                {openingApercu ? "Sauvegarde..." : "Aperçu / PDF"}
              </button>
              <button onClick={sendWhatsApp}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: "#25D366" }}>
                <MessageCircle size={14} strokeWidth={2} />
                WhatsApp
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB MARGE — CONFIDENTIEL ADMIN
      ══════════════════════════════════════════════════════════════════ */}
      {tab === "marge" && (
        <div className="space-y-5">
          {/* Bandeau confidentiel */}
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
            style={{ background: "color-mix(in oklch, #EF4444 10%, var(--background))", border: "1px solid color-mix(in oklch, #EF4444 25%, transparent)", color: "#EF4444" }}>
            <Lock size={14} strokeWidth={2.5} />
            CONFIDENTIEL — Analyse de marge AfriNomade · Usage interne uniquement
          </div>

          {!hasCotation ? (
            <div className="text-center py-12 rounded-xl"
              style={{ border: "1px dashed color-mix(in oklch, #EF4444 20%, transparent)", color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
              <TrendingUp size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Générez d'abord une cotation dans l'onglet Cotation</p>
            </div>
          ) : (
            <>
              {/* ── KPIs globaux ── */}
              {(() => {
                const margeStd = totalStdCout > 0 ? ((totalStd - totalStdCout) / totalStdCout) * 100 : 0;
                const margePrm = totalPrmCout > 0 ? ((totalPrm - totalPrmCout) / totalPrmCout) * 100 : 0;
                const margeRef = lignesPremium.length > 0 && formuleChoisie === "premium" ? margePrm : margeStd;
                const totalRef = formuleChoisie === "premium" ? totalPrm : totalStd;
                const totalRefCout = formuleChoisie === "premium" ? totalPrmCout : totalStdCout;
                const budgetAnnonce = d.budget ?? "Non communiqué";
                const lignesAlerte = [...lignesStandard, ...lignesPremium].filter(l => l.marge_pct < 15);

                return (
                  <>
                    {/* Alertes lignes sous 15% */}
                    {lignesAlerte.length > 0 && (
                      <div className="rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
                        style={{ background: "color-mix(in oklch, #f59e0b 10%, var(--background))", border: "1px solid color-mix(in oklch, #f59e0b 25%, transparent)" }}>
                        <AlertTriangle size={16} style={{ color: "#f59e0b", marginTop: 1, flexShrink: 0 }} />
                        <div>
                          <p className="font-semibold" style={{ color: "#f59e0b" }}>
                            {lignesAlerte.length} ligne{lignesAlerte.length > 1 ? "s" : ""} sous la marge minimale de 15%
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                            {lignesAlerte.map(l => `${l.poste} (${l.marge_pct}%)`).join(" · ")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Métriques clés */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        {
                          label: "Marge brute (réf.)",
                          value: fmt(totalRef - totalRefCout),
                          sub: `${Math.round(margeRef)}%`,
                          ok: margeRef >= 15,
                          icon: "💰",
                        },
                        {
                          label: "Coût de revient",
                          value: fmt(totalRefCout),
                          sub: "charges réelles",
                          ok: true,
                          icon: "📦",
                        },
                        {
                          label: "Prix de vente",
                          value: fmt(totalRef),
                          sub: `${fmt(Math.round(totalRef / voyageurs))} /pers.`,
                          ok: true,
                          icon: "🏷️",
                        },
                        {
                          label: "Budget client",
                          value: budgetAnnonce,
                          sub: "annoncé",
                          ok: true,
                          icon: "💬",
                        },
                      ].map(({ label, value, sub, ok, icon }) => (
                        <div key={label} className="rounded-xl p-4"
                          style={{
                            background: "color-mix(in oklch, var(--background) 80%, transparent)",
                            border: `1px solid ${ok ? "color-mix(in oklch, var(--foreground) 8%, transparent)" : "color-mix(in oklch, #EF4444 30%, transparent)"}`,
                          }}>
                          <div className="text-lg mb-1">{icon}</div>
                          <div className="text-xs mb-1" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>{label}</div>
                          <div className="font-bold text-sm"
                            style={{ color: !ok ? "#EF4444" : "var(--gold-premium)" }}>{value}</div>
                          <div className="text-xs mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>{sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* ── Tableau Standard ── */}
                    {lignesStandard.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "color-mix(in oklch, var(--turquoise) 15%, transparent)", color: "var(--turquoise)" }}>
                            ⭐ Standard Confort
                          </span>
                          {formuleChoisie === "standard" && (
                            <span className="text-xs font-bold" style={{ color: "var(--turquoise)" }}>
                              <CheckCircle2 size={12} className="inline mr-0.5" />Formule choisie
                            </span>
                          )}
                        </div>
                        <div className="rounded-xl overflow-x-auto"
                          style={{ border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)" }}>
                          <table className="w-full text-xs min-w-[650px]">
                            <thead style={{ background: "color-mix(in oklch, var(--turquoise) 10%, transparent)" }}>
                              <tr>
                                {["Poste", "Coût réel", "Qté", "Total coût", "Total facturé", "Marge FCFA", "Marge %"].map(h => (
                                  <th key={h} className="px-3 py-2.5 text-left font-semibold"
                                    style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {lignesStandard.map((l, i) => {
                                const margeFCFA = l.total_facture - l.total_cout;
                                const margePct  = l.total_cout > 0 ? Math.round((margeFCFA / l.total_cout) * 100) : 0;
                                return (
                                  <tr key={i} className="border-t hover:bg-white/[0.015]"
                                    style={{ borderColor: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                                    <td className="px-3 py-2 font-medium">{l.poste}
                                      {l.description && <span className="block text-[10px] opacity-50">{l.description}</span>}
                                    </td>
                                    <td className="px-3 py-2 text-right">{l.cout_reel.toLocaleString("fr-FR")}</td>
                                    <td className="px-3 py-2 text-center">{l.quantite}</td>
                                    <td className="px-3 py-2 text-right">{l.total_cout.toLocaleString("fr-FR")}</td>
                                    <td className="px-3 py-2 text-right font-semibold" style={{ color: "var(--gold-premium)" }}>{l.total_facture.toLocaleString("fr-FR")}</td>
                                    <td className="px-3 py-2 text-right font-semibold" style={{ color: "var(--turquoise)" }}>+{margeFCFA.toLocaleString("fr-FR")}</td>
                                    <td className="px-3 py-2 text-right font-bold"
                                      style={{ color: margePct >= 15 ? "var(--turquoise)" : "#EF4444" }}>
                                      {margePct}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot style={{ background: "color-mix(in oklch, var(--turquoise) 8%, transparent)", borderTop: "2px solid color-mix(in oklch, var(--turquoise) 20%, transparent)" }}>
                              <tr>
                                <td className="px-3 py-2.5 font-bold text-xs">TOTAL STANDARD</td>
                                <td />
                                <td />
                                <td className="px-3 py-2.5 text-right font-bold">{totalStdCout.toLocaleString("fr-FR")}</td>
                                <td className="px-3 py-2.5 text-right font-bold" style={{ color: "var(--gold-premium)" }}>{totalStd.toLocaleString("fr-FR")}</td>
                                <td className="px-3 py-2.5 text-right font-bold" style={{ color: "var(--turquoise)" }}>+{(totalStd - totalStdCout).toLocaleString("fr-FR")}</td>
                                <td className="px-3 py-2.5 text-right font-bold"
                                  style={{ color: totalStdCout > 0 && ((totalStd - totalStdCout) / totalStdCout) >= 0.15 ? "var(--turquoise)" : "#EF4444" }}>
                                  {totalStdCout > 0 ? Math.round(((totalStd - totalStdCout) / totalStdCout) * 100) : 0}%
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ── Tableau Premium ── */}
                    {lignesPremium.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "color-mix(in oklch, var(--gold-premium) 15%, transparent)", color: "var(--gold-premium)" }}>
                            👑 Premium Famille
                          </span>
                          {formuleChoisie === "premium" && (
                            <span className="text-xs font-bold" style={{ color: "var(--gold-premium)" }}>
                              <CheckCircle2 size={12} className="inline mr-0.5" />Formule choisie
                            </span>
                          )}
                        </div>
                        <div className="rounded-xl overflow-x-auto"
                          style={{ border: "1px solid color-mix(in oklch, var(--gold-premium) 15%, transparent)" }}>
                          <table className="w-full text-xs min-w-[650px]">
                            <thead style={{ background: "color-mix(in oklch, var(--gold-premium) 10%, transparent)" }}>
                              <tr>
                                {["Poste", "Coût réel", "Qté", "Total coût", "Total facturé", "Marge FCFA", "Marge %"].map(h => (
                                  <th key={h} className="px-3 py-2.5 text-left font-semibold"
                                    style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {lignesPremium.map((l, i) => {
                                const margeFCFA = l.total_facture - l.total_cout;
                                const margePct  = l.total_cout > 0 ? Math.round((margeFCFA / l.total_cout) * 100) : 0;
                                return (
                                  <tr key={i} className="border-t hover:bg-white/[0.015]"
                                    style={{ borderColor: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                                    <td className="px-3 py-2 font-medium">{l.poste}
                                      {l.description && <span className="block text-[10px] opacity-50">{l.description}</span>}
                                    </td>
                                    <td className="px-3 py-2 text-right">{l.cout_reel.toLocaleString("fr-FR")}</td>
                                    <td className="px-3 py-2 text-center">{l.quantite}</td>
                                    <td className="px-3 py-2 text-right">{l.total_cout.toLocaleString("fr-FR")}</td>
                                    <td className="px-3 py-2 text-right font-semibold" style={{ color: "var(--gold-premium)" }}>{l.total_facture.toLocaleString("fr-FR")}</td>
                                    <td className="px-3 py-2 text-right font-semibold" style={{ color: "#CFAE63" }}>+{margeFCFA.toLocaleString("fr-FR")}</td>
                                    <td className="px-3 py-2 text-right font-bold"
                                      style={{ color: margePct >= 15 ? "#CFAE63" : "#EF4444" }}>
                                      {margePct}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot style={{ background: "color-mix(in oklch, var(--gold-premium) 8%, transparent)", borderTop: "2px solid color-mix(in oklch, var(--gold-premium) 20%, transparent)" }}>
                              <tr>
                                <td className="px-3 py-2.5 font-bold text-xs">TOTAL PREMIUM</td>
                                <td />
                                <td />
                                <td className="px-3 py-2.5 text-right font-bold">{totalPrmCout.toLocaleString("fr-FR")}</td>
                                <td className="px-3 py-2.5 text-right font-bold" style={{ color: "var(--gold-premium)" }}>{totalPrm.toLocaleString("fr-FR")}</td>
                                <td className="px-3 py-2.5 text-right font-bold" style={{ color: "#CFAE63" }}>+{(totalPrm - totalPrmCout).toLocaleString("fr-FR")}</td>
                                <td className="px-3 py-2.5 text-right font-bold"
                                  style={{ color: totalPrmCout > 0 && ((totalPrm - totalPrmCout) / totalPrmCout) >= 0.15 ? "#CFAE63" : "#EF4444" }}>
                                  {totalPrmCout > 0 ? Math.round(((totalPrm - totalPrmCout) / totalPrmCout) * 100) : 0}%
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ── Synthèse Standard vs Premium ── */}
                    {lignesStandard.length > 0 && lignesPremium.length > 0 && (
                      <div className="rounded-xl p-5"
                        style={{ background: "color-mix(in oklch, #EF4444 5%, var(--background))", border: "1px solid color-mix(in oklch, #EF4444 15%, transparent)" }}>
                        <div className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "#EF4444" }}>
                          <TrendingUp size={13} />SYNTHÈSE RENTABILITÉ
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {[
                            ["Marge brute Standard", fmt(totalStd - totalStdCout), totalStdCout > 0 ? Math.round(((totalStd - totalStdCout) / totalStdCout) * 100) + "%" : "—"],
                            ["Marge brute Premium",  fmt(totalPrm - totalPrmCout), totalPrmCout > 0 ? Math.round(((totalPrm - totalPrmCout) / totalPrmCout) * 100) + "%" : "—"],
                            ["Surplus Premium/Std",  fmt((totalPrm - totalPrmCout) - (totalStd - totalStdCout)), "+FCFA"],
                            ["Formule choisie",      formuleChoisie ? (formuleChoisie === "standard" ? "⭐ Standard" : "👑 Premium") : "Non définie", ""],
                          ].map(([lbl, val, pct]) => (
                            <div key={lbl as string}>
                              <div className="text-xs mb-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>{lbl}</div>
                              <div className="font-bold" style={{ color: "var(--gold-premium)" }}>{val}</div>
                              {pct && pct !== "+FCFA" && (
                                <div className="text-xs mt-0.5 font-semibold" style={{ color: "var(--turquoise)" }}>{pct}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
