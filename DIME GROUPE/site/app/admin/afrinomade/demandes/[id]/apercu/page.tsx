"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type {
  AfriNomadeDemande, LigneCotation, FormuleCotation, JourItineraire,
} from "@/lib/afrinomade-types";

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseJ<T>(v: unknown): T | undefined {
  if (!v) return undefined;
  if (typeof v === "string") { try { return JSON.parse(v) as T; } catch { return undefined; } }
  return v as T;
}
function fmtN(n: number) { return n.toLocaleString("fr-FR"); }
function fmtF(n: number) { return fmtN(n) + " FCFA"; }
function fmtDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Couleurs ─────────────────────────────────────────────────────────────────
const VERT  = "#1B3D2F";
const OR    = "#D4903C";
const TURQ  = "#0BA5A4";
const GOLD  = "#CFAE63";

// ── Sous-composants ───────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ borderTop: `2px solid ${OR}`, margin: "16px 0" }} />;
}

function SectionTitle({ icon, text, color = VERT }: { icon: string; text: string; color?: string }) {
  return (
    <div style={{
      background: color, color: "white", padding: "6px 14px",
      borderRadius: 4, fontWeight: "bold", fontSize: 13, marginBottom: 10,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span>{icon}</span><span>{text}</span>
    </div>
  );
}

function LignesTable({ lignes, accentColor }: { lignes: LigneCotation[]; accentColor: string }) {
  if (!lignes.length) return null;
  const total = lignes.reduce((s, l) => s + l.total_facture, 0);

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 6 }}>
      <thead>
        <tr style={{ background: accentColor }}>
          {["Prestation", "Détail", "Qté", "Unité", "Prix unitaire", "Total"].map((h) => (
            <th key={h} style={{
              padding: "7px 8px", color: "white", textAlign: "left", fontWeight: "bold",
              borderRight: "1px solid rgba(255,255,255,0.2)",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {lignes.map((l, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "#FFF8EE" : "white" }}>
            <td style={{ padding: "6px 8px", fontWeight: 600, borderBottom: "1px solid #eee" }}>{l.poste}</td>
            <td style={{ padding: "6px 8px", color: "#555", fontSize: 11, borderBottom: "1px solid #eee" }}>{l.description ?? "—"}</td>
            <td style={{ padding: "6px 8px", textAlign: "center", borderBottom: "1px solid #eee" }}>{l.quantite}</td>
            <td style={{ padding: "6px 8px", color: "#777", borderBottom: "1px solid #eee" }}>{l.unite}</td>
            <td style={{ padding: "6px 8px", textAlign: "right", borderBottom: "1px solid #eee" }}>{fmtN(l.prix_client)}</td>
            <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: OR, borderBottom: "1px solid #eee" }}>{fmtN(l.total_facture)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ background: accentColor + "15" }}>
          <td colSpan={5} style={{ padding: "8px", textAlign: "right", fontWeight: "bold", fontSize: 13 }}>TOTAL</td>
          <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold", fontSize: 15, color: OR }}>
            {fmtF(total)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

function TotauxBlock({
  total, voyageurs, accentColor, formuleChoisie, isChoisie,
}: {
  total: number; voyageurs: number; accentColor: string; formuleChoisie?: boolean; isChoisie?: boolean;
}) {
  return (
    <div style={{
      display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8,
      padding: "10px 14px", borderRadius: 6,
      background: accentColor + "12",
      border: `1px solid ${accentColor}40`,
    }}>
      {[
        ["Total séjour", fmtF(total), true],
        ["Prix / personne", fmtF(Math.round(total / voyageurs)), false],
        ["Acompte 50%", fmtF(Math.round(total * 0.5)), false],
        ["Solde restant", fmtF(Math.round(total * 0.5)), false],
      ].map(([lbl, val, bold]) => (
        <div key={lbl as string} style={{ flex: "1 1 150px", minWidth: 140 }}>
          <div style={{ fontSize: 10, color: "#777", marginBottom: 2 }}>{lbl}</div>
          <div style={{ fontWeight: bold ? "bold" : 600, fontSize: bold ? 16 : 13, color: bold ? OR : "#333" }}>{val}</div>
        </div>
      ))}
      {isChoisie && (
        <div style={{
          alignSelf: "center", background: accentColor, color: "white",
          borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: "bold",
        }}>
          ✓ Formule choisie
        </div>
      )}
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function ApercuPage() {
  const { id } = useParams<{ id: string }>();
  const [d, setD]                   = useState<AfriNomadeDemande | null>(null);
  const [loading, setLoading]       = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const downloadExcel = async () => {
    const cached = sessionStorage.getItem(`apercu-${id}`);
    let res: Response;
    if (cached) {
      res = await fetch(`/api/admin/afrinomade/export-excel/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: cached,
      });
    } else {
      res = await fetch(`/api/admin/afrinomade/export-excel/${id}`);
    }
    if (!res.ok) { alert('Erreur génération Excel'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afrinomade-cotation-${id.slice(0, 8)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async (refLabel: string, nom: string, prenom: string) => {
    const el = document.getElementById('pdf-content');
    if (!el) return;
    setDownloadingPDF(true);
    try {
      // Import dynamique pour éviter le chargement côté serveur
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF }   = await import('jspdf');

      // Capturer le DOM avec résolution 2× pour la qualité
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Largeur fixe pour un rendu A4 cohérent
        windowWidth: 860,
      });

      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW   = pdf.internal.pageSize.getWidth();   // 210 mm
      const pageH   = pdf.internal.pageSize.getHeight();  // 297 mm
      const imgW    = pageW;
      const imgH    = (canvas.height * imgW) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      // Découpage multi-pages si le contenu dépasse une page A4
      let remaining = imgH;
      let offset    = 0;
      pdf.addImage(imgData, 'JPEG', 0, -offset, imgW, imgH);
      remaining -= pageH;
      offset    += pageH;

      while (remaining > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -offset, imgW, imgH);
        remaining -= pageH;
        offset    += pageH;
      }

      pdf.save(`AfriNomade-Cotation-${refLabel}-${prenom}-${nom}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération du PDF. Essayez "Imprimer / Exporter PDF".');
    } finally {
      setDownloadingPDF(false);
    }
  };

  useEffect(() => {
    // 1. Priorité : données fraîches stockées dans sessionStorage par la page admin
    const cached = sessionStorage.getItem(`apercu-${id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setD(parsed);
        setLoading(false);
        return; // pas besoin d'appel API
      } catch { /* fallback vers API */ }
    }
    // 2. Fallback : lecture depuis la DB
    fetch(`/api/admin/afrinomade/demandes/${id}`)
      .then((r) => r.json())
      .then((data) => { setD(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🌍</div>
      Chargement de la cotation...
    </div>
  );
  if (!d) return (
    <div style={{ padding: 40, textAlign: "center" }}>Demande introuvable</div>
  );

  // ── Résoudre les données ──────────────────────────────────────────────────
  const formules   = parseJ<FormuleCotation[]>(d.formules as unknown);
  const itineraire = parseJ<JourItineraire[]>(d.itineraire as unknown) ?? [];
  const legacy     = parseJ<LigneCotation[]>(d.cotation as unknown) ?? [];

  let stdLignes: LigneCotation[];
  let prmLignes: LigneCotation[];

  if (formules && formules.length > 0) {
    stdLignes = formules.find((f) => f.id === "standard")?.lignes ?? legacy;
    prmLignes = formules.find((f) => f.id === "premium")?.lignes  ?? [];
  } else {
    stdLignes = legacy;
    prmLignes = [];
  }

  const voyageurs  = (d.nb_adultes ?? 1) + (d.nb_enfants ?? 0);
  const totalStd   = stdLignes.reduce((s, l) => s + l.total_facture, 0);
  const totalPrm   = prmLignes.reduce((s, l) => s + l.total_facture, 0);
  const hasPremium = prmLignes.length > 0;
  const hasItin    = itineraire.length > 0;
  const ref        = d.reference
    ?? `AN-${(d.pays_destination ?? "XX").slice(0, 2).toUpperCase()}-${new Date().getFullYear()}-${id.slice(0, 4).toUpperCase()}`;
  const circuitLabel = [d.pays_destination, ...(d.villes ?? [])].filter(Boolean).join(" — ");

  return (
    <>
      {/* ── Barre d'outils — masquée à l'impression ──────────────────── */}
      <div className="no-print" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        background: VERT, padding: "10px 20px",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        <a href={`/admin/afrinomade/demandes/${id}`}
          style={{ color: "white", textDecoration: "none", fontSize: 13, opacity: 0.85 }}>
          ← Retour
        </a>
        <div style={{ flex: 1, textAlign: "center", color: "white", fontWeight: "bold", fontSize: 14 }}>
          Aperçu cotation — {d.prenom} {d.nom} · {ref}
        </div>
        {/* Télécharger PDF — capture exacte du rendu */}
        <button
          onClick={() => downloadPDF(ref, d.nom ?? "", d.prenom ?? "")}
          disabled={downloadingPDF}
          style={{
            background: downloadingPDF ? "#555" : "#e11d48",
            color: "white", border: "none",
            borderRadius: 8, padding: "9px 22px", cursor: downloadingPDF ? "wait" : "pointer",
            fontWeight: "bold", fontSize: 14, display: "flex", alignItems: "center", gap: 8,
            opacity: downloadingPDF ? 0.8 : 1, transition: "opacity 0.2s",
          }}
        >
          {downloadingPDF
            ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Génération…</>
            : <>📄 Télécharger la facture</>
          }
        </button>
        <button onClick={() => window.print()}
          style={{
            background: OR, color: "white", border: "none",
            borderRadius: 8, padding: "9px 16px", cursor: "pointer",
            fontWeight: "bold", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
          }}>
          🖨️&nbsp;Imprimer
        </button>
        <button onClick={downloadExcel} style={{ background: "#217346", color: "white", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: "bold", fontSize: 13, cursor: "pointer" }}>
          📊 Excel
        </button>
      </div>

      {/* ── Document ──────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 60 }} className="print-root">
        <div
          id="pdf-content"
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            maxWidth: 820, margin: "20px auto",
            padding: "0 20px 40px",
            color: "#1a1a1a", fontSize: 13, lineHeight: 1.55,
          }}>

          {/* ── En-tête brandé ─────────────────────────────────────────── */}
          <div style={{
            background: `linear-gradient(135deg, ${VERT} 0%, #2a5c44 100%)`,
            borderRadius: "8px 8px 0 0",
            padding: "20px 28px",
            color: "white",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: 0.5 }}>
                🌍 AfriNomade
              </div>
              <div style={{ fontSize: 11, opacity: 0.8, fontStyle: "italic", marginTop: 2 }}>
                "Explore. Ressens. Reviens changé."
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Référence</div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#FFD580" }}>{ref}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                Émis le {new Date().toLocaleDateString("fr-FR")}
              </div>
            </div>
          </div>

          {/* ── Bandeau circuit ────────────────────────────────────────── */}
          <div style={{
            background: OR, color: "white",
            padding: "10px 28px",
            fontSize: 15, fontWeight: "bold", letterSpacing: 0.3,
          }}>
            Circuit {circuitLabel}
            {d.type_service && <span style={{ fontSize: 12, fontWeight: "normal", opacity: 0.9, marginLeft: 12 }}>
              · {d.type_service}
            </span>}
          </div>

          {/* ── Infos client ───────────────────────────────────────────── */}
          <div style={{
            background: "#f9f6f0", padding: "14px 28px",
            borderLeft: `4px solid ${VERT}`, marginBottom: 20,
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 20px", fontSize: 12,
            }}>
              {[
                ["Client", `${d.prenom} ${d.nom}`],
                ["Contact", `${d.telephone ?? "—"} · ${d.email ?? "—"}`],
                ["Résidence", d.pays_residence ?? "—"],
                ["Dates", d.date_depart ? `${fmtDate(d.date_depart)} → ${fmtDate(d.date_retour)} (${d.nb_nuits}n)` : "—"],
                ["Voyageurs", `${d.nb_adultes ?? 1} adulte(s) + ${d.nb_enfants ?? 0} enfant(s) = ${voyageurs} pers.`],
                ["Hébergement", `${d.type_hebergement ?? "—"}${d.nb_chambres ? ` · ${d.nb_chambres} ch.` : ""}`],
                ...(d.type_vehicule ? [["Transport", d.type_vehicule]] as [string, string][] : []),
                ...(d.langue_guide && d.langue_guide !== "Pas besoin de guide" ? [["Guide", d.langue_guide]] as [string, string][] : []),
                ...(d.activites?.length ? [["Activités", d.activites.join(", ")]] as [string, string][] : []),
              ].map(([k, v]) => (
                <div key={k}>
                  <span style={{ color: "#888", fontSize: 11 }}>{k} : </span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              FORMULE STANDARD
          ══════════════════════════════════════════════════════════════ */}
          {stdLignes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionTitle icon="⭐" text="FORMULE STANDARD CONFORT" color={TURQ} />
              <LignesTable lignes={stdLignes} accentColor={TURQ} />
              <TotauxBlock
                total={totalStd} voyageurs={voyageurs} accentColor={TURQ}
                isChoisie={d.formule_choisie === "standard"}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              FORMULE PREMIUM
          ══════════════════════════════════════════════════════════════ */}
          {hasPremium && (
            <div style={{ marginBottom: 24 }}>
              <SectionTitle icon="👑" text="FORMULE PREMIUM FAMILLE" color={GOLD} />
              <LignesTable lignes={prmLignes} accentColor={GOLD} />
              <TotauxBlock
                total={totalPrm} voyageurs={voyageurs} accentColor={GOLD}
                isChoisie={d.formule_choisie === "premium"}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              COMPARATIF (si multi-formules)
          ══════════════════════════════════════════════════════════════ */}
          {hasPremium && totalStd > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Divider />
              <SectionTitle icon="📊" text="COMPARATIF DES FORMULES" color={VERT} />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: VERT }}>
                    <th style={{ padding: "8px 12px", color: "white", textAlign: "left" }}>Critère</th>
                    <th style={{ padding: "8px 12px", color: "#7fffd4", textAlign: "right" }}>⭐ Standard Confort</th>
                    <th style={{ padding: "8px 12px", color: "#FFD580", textAlign: "right" }}>👑 Premium Famille</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Total séjour",    fmtF(totalStd), fmtF(totalPrm)],
                    ["Prix / personne", fmtF(Math.round(totalStd / voyageurs)), fmtF(Math.round(totalPrm / voyageurs))],
                    ["Acompte 50%",     fmtF(Math.round(totalStd * 0.5)),       fmtF(Math.round(totalPrm * 0.5))],
                    ["Solde restant",   fmtF(Math.round(totalStd * 0.5)),       fmtF(Math.round(totalPrm * 0.5))],
                  ].map(([lbl, vs, vp], i) => (
                    <tr key={lbl} style={{ background: i % 2 === 0 ? "#f5f5f5" : "white" }}>
                      <td style={{ padding: "7px 12px", fontWeight: 600 }}>{lbl}</td>
                      <td style={{ padding: "7px 12px", textAlign: "right", color: "#0BA5A4", fontWeight: 700 }}>{vs}</td>
                      <td style={{ padding: "7px 12px", textAlign: "right", color: "#CFAE63", fontWeight: 700 }}>{vp}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#FFF8EE", borderTop: `2px solid ${OR}` }}>
                    <td style={{ padding: "7px 12px", fontWeight: "bold" }}>Différence Premium / Standard</td>
                    <td style={{ padding: "7px 12px" }} />
                    <td style={{ padding: "7px 12px", textAlign: "right", fontWeight: "bold", color: OR }}>
                      + {fmtF(totalPrm - totalStd)} (+{Math.round(((totalPrm - totalStd) / totalStd) * 100)}%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              ITINÉRAIRE
          ══════════════════════════════════════════════════════════════ */}
          {hasItin && (
            <div style={{ marginBottom: 24, pageBreakBefore: "always" }}>
              <Divider />
              <SectionTitle icon="🗺️" text={`ITINÉRAIRE JOUR PAR JOUR · ${d.nb_nuits ?? "?"} NUITS`} color="#3B82F6" />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#3B82F6" }}>
                    {["Jour", "Ville", "Programme", "Hébergement", "Tps route"].map((h) => (
                      <th key={h} style={{ padding: "7px 10px", color: "white", textAlign: "left", fontWeight: "bold" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {itineraire.map((j, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#EBF3FF" : "white" }}>
                      <td style={{ padding: "7px 10px", fontWeight: "bold", color: "#3B82F6", whiteSpace: "nowrap" }}>{j.jour}</td>
                      <td style={{ padding: "7px 10px", fontWeight: 600, whiteSpace: "nowrap" }}>{j.ville}</td>
                      <td style={{ padding: "7px 10px", color: "#444" }}>{j.programme}</td>
                      <td style={{ padding: "7px 10px", color: "#666", whiteSpace: "nowrap" }}>{j.hebergement ?? "—"}</td>
                      <td style={{ padding: "7px 10px", color: "#888", textAlign: "center", whiteSpace: "nowrap" }}>{j.temps_route ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              CONDITIONS
          ══════════════════════════════════════════════════════════════ */}
          <Divider />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Inclus */}
            <div style={{
              border: `1px solid ${VERT}40`,
              borderRadius: 6, padding: "12px 16px",
              background: "#f0fff4",
            }}>
              <div style={{ fontWeight: "bold", color: VERT, marginBottom: 8, fontSize: 12 }}>✅ CE QUI EST INCLUS</div>
              {[
                "Transport selon formule choisie",
                "Hébergement pour la durée indiquée",
                "Guide / accompagnateur (si sélectionné)",
                "Activités listées dans la cotation",
                hasPremium ? "🌟 Accueil VIP aéroport (Premium)" : null,
                hasPremium ? "🌟 Conciergerie 24h (Premium)" : null,
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{ fontSize: 11, color: "#333", marginBottom: 3 }}>• {item}</div>
              ))}
            </div>
            {/* Non inclus */}
            <div style={{
              border: "1px solid #f9731640",
              borderRadius: 6, padding: "12px 16px",
              background: "#fff8f5",
            }}>
              <div style={{ fontWeight: "bold", color: "#D97706", marginBottom: 8, fontSize: 12 }}>⚠️ À LA CHARGE DU CLIENT</div>
              {[
                "Restauration (sauf petit-déjeuner en hôtel)",
                "Carburant du véhicule",
                "Dépenses personnelles",
                "Assurance voyage (recommandée)",
                "Visas et documents de voyage",
              ].map((item, i) => (
                <div key={i} style={{ fontSize: 11, color: "#333", marginBottom: 3 }}>• {item}</div>
              ))}
            </div>
          </div>

          {/* Conditions annulation */}
          <div style={{
            border: `1px solid ${VERT}30`,
            borderRadius: 6, padding: "12px 16px", marginBottom: 20,
            background: "#f9f6f0",
          }}>
            <div style={{ fontWeight: "bold", color: VERT, marginBottom: 8, fontSize: 12 }}>📋 CONDITIONS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {[
                ["Validité de la cotation", "7 jours à compter de la date d'émission"],
                ["Confirmation", "Acompte de 50% requis pour confirmer"],
                ["Annulation > 14 jours", "Remboursement intégral"],
                ["Annulation 7 à 14 jours", "50% retenus"],
                ["Annulation < 7 jours", "Non remboursable"],
                ["Paiement", "Virement, Mobile Money ou espèces"],
              ].map(([k, v]) => (
                <div key={k} style={{ fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "#666" }}>{k} : </span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pied de page ──────────────────────────────────────────── */}
          <div style={{
            background: VERT, color: "white",
            padding: "12px 24px", borderRadius: "0 0 8px 8px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: 12,
          }}>
            <div>
              <div style={{ fontWeight: "bold" }}>AfriNomade by DIME GROUPE</div>
              <div style={{ opacity: 0.7, fontSize: 11 }}>contact@dimegroupe.ci</div>
            </div>
            <div style={{ textAlign: "right", opacity: 0.8, fontSize: 11 }}>
              <div>Réf. {ref}</div>
              <div>Valide jusqu&apos;au {new Date(Date.now() + 7 * 86_400_000).toLocaleDateString("fr-FR")}</div>
            </div>
          </div>

        </div>
      </div>

      {/* ── CSS impression + animations ─────────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          .no-print { display: none !important; }
          .print-root { padding-top: 0 !important; }
          body { background: white !important; }
          @page {
            size: A4;
            margin: 12mm 12mm 15mm 12mm;
          }
        }
        @media screen {
          body { background: #f3f4f6; }
        }
      `}</style>
    </>
  );
}
