"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, RefreshCw, ArrowLeftRight, TrendingUp, Table2, Calculator } from "lucide-react";

const CURRENCIES = [
  { code: "XOF", name: "Franc CFA (UEMOA)", symbol: "FCFA",  flag: "🇨🇮" },
  { code: "XAF", name: "Franc CFA (CEMAC)", symbol: "XAF",   flag: "🇨🇲" },
  { code: "EUR", name: "Euro",              symbol: "€",      flag: "🇪🇺" },
  { code: "USD", name: "Dollar US",         symbol: "$",      flag: "🇺🇸" },
  { code: "GBP", name: "Livre Sterling",    symbol: "£",      flag: "🇬🇧" },
  { code: "MAD", name: "Dirham Marocain",   symbol: "MAD",    flag: "🇲🇦" },
  { code: "GHS", name: "Cedi Ghanéen",      symbol: "GH₵",   flag: "🇬🇭" },
  { code: "NGN", name: "Naira Nigérian",    symbol: "₦",      flag: "🇳🇬" },
  { code: "GNF", name: "Franc Guinéen",     symbol: "GNF",    flag: "🇬🇳" },
  { code: "CAD", name: "Dollar Canadien",   symbol: "CA$",    flag: "🇨🇦" },
];

// Taux approximatifs de secours (mis à jour manuellement)
const FALLBACK_RATES: Record<string, number> = {
  XOF: 1, XAF: 1, EUR: 0.001524, USD: 0.001648,
  GBP: 0.001286, MAD: 0.016524, GHS: 0.02398,
  NGN: 2.47, GNF: 14.26, CAD: 0.00228,
};

interface Rates { [code: string]: number; }

interface CurrencyConverterProps {
  onClose: () => void;
  defaultAmount?: number;
  baseCurrency?: string;
}

// Format un nombre : 4 décimales si < 1, 2 décimales sinon
function fmtRate(n: number): string {
  if (n === 0) return "—";
  if (n >= 1000) return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  if (n >= 1)    return n.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

const AUTO_REFRESH_MS = 30 * 60 * 1000; // 30 minutes

export default function CurrencyConverter({
  onClose,
  defaultAmount = 100000,
  baseCurrency  = "XOF",
}: CurrencyConverterProps) {
  const [rates,     setRates]     = useState<Rates>({});
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [amount,    setAmount]    = useState(String(defaultAmount));
  const [fromCode,  setFromCode]  = useState(baseCurrency);
  const [toCode,    setToCode]    = useState("EUR");
  const [lastSync,  setLastSync]  = useState<Date | null>(null);
  const [tab,       setTab]       = useState<"converter" | "rates">("converter");
  const [refBase,   setRefBase]   = useState("XOF"); // devise de référence pour le tableau des taux
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/XOF");
      if (!res.ok) throw new Error("API indisponible");
      const data = await res.json();
      if (data.result === "success") {
        setRates(data.rates as Rates);
        setLastSync(new Date());
      } else {
        throw new Error("Données invalides");
      }
    } catch {
      setRates(FALLBACK_RATES);
      setError("Taux approximatifs — impossible de contacter l'API de change");
    } finally {
      setLoading(false);
      // Planifier le prochain rafraîchissement automatique
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(loadRates, AUTO_REFRESH_MS);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadRates();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [loadRates]);

  // Conversion universelle via XOF comme pivot
  const convert = (val: number, from: string, to: string): number => {
    if (!rates[from] || !rates[to]) return 0;
    const inXOF = from === "XOF" ? val : val / rates[from];
    return to === "XOF" ? inXOF : inXOF * rates[to];
  };

  // 1 UNIT of `from` = X `to`  (ex: 1 EUR = 655.957 XOF)
  const unitRate = (from: string, to: string): number => convert(1, from, to);

  const numAmount = parseFloat(amount.replace(/[\s ]/g, "")) || 0;
  const result    = convert(numAmount, fromCode, toCode);

  const swap = () => { setFromCode(toCode); setToCode(fromCode); };

  const symOf  = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
  const flagOf = (code: string) => CURRENCIES.find((c) => c.code === code)?.flag   ?? "";

  const allConversions = CURRENCIES.filter((c) => c.code !== fromCode).map((c) => ({
    ...c,
    value: convert(numAmount, fromCode, c.code),
  }));

  // Tableau des taux de référence : 1 [chaque devise] = X [refBase]
  const refRates = CURRENCIES.filter((c) => c.code !== refBase).map((c) => ({
    ...c,
    rate: unitRate(c.code, refBase),
    rateInverse: unitRate(refBase, c.code),
  }));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="glass glass-strong rounded-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col"
        style={{
          border: "1px solid color-mix(in oklch, var(--gold-premium) 20%, transparent)",
          maxHeight: "92vh",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={18} style={{ color: "var(--gold-premium)" }} strokeWidth={2} />
            <div>
              <h3 className="font-bold text-base">Convertisseur de devises</h3>
              <p className="text-[10px]" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                {lastSync
                  ? `Taux mis à jour : ${lastSync.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · auto-actualisation 30 min`
                  : "Chargement des taux…"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadRates}
              title="Rafraîchir maintenant"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} style={{ color: "var(--gold-premium)" }} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Tab switcher ────────────────────────────────────────────────────── */}
        <div
          className="flex shrink-0 px-5 pt-3 gap-2"
          style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}
        >
          {(
            [
              { id: "converter", label: "Convertisseur", icon: Calculator },
              { id: "rates",     label: "Taux de référence", icon: Table2 },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-3 pb-2.5 text-xs font-semibold transition-all border-b-2"
              style={{
                borderColor: tab === id ? "var(--gold-premium)" : "transparent",
                color:
                  tab === id
                    ? "var(--gold-premium)"
                    : "color-mix(in oklch, var(--foreground) 50%, transparent)",
              }}
            >
              <Icon size={13} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">

          {/* ═══ ONGLET CONVERTISSEUR ══════════════════════════════════════════ */}
          {tab === "converter" && (
            <div className="p-5 space-y-4">
              {error && (
                <div
                  className="rounded-lg p-3 text-xs"
                  style={{
                    background: "color-mix(in oklch, #CFAE63 10%, transparent)",
                    color: "#CFAE63",
                    border: "1px solid color-mix(in oklch, #CFAE63 20%, transparent)",
                  }}
                >
                  ⚠ {error}
                </div>
              )}

              {/* Montant + devise source */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label
                    className="text-xs font-semibold mb-1 block"
                    style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}
                  >
                    Montant
                  </label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                    className="w-full rounded-xl px-4 py-3 text-lg font-bold outline-none focus:ring-2"
                    style={{
                      background: "color-mix(in oklch, var(--gold-premium) 8%, var(--background))",
                      border: "1px solid color-mix(in oklch, var(--gold-premium) 25%, transparent)",
                      color: "var(--gold-premium)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-semibold mb-1 block"
                    style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}
                  >
                    De
                  </label>
                  <select
                    value={fromCode}
                    onChange={(e) => setFromCode(e.target.value)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold appearance-none outline-none focus:ring-2 focus:ring-[var(--gold-premium)] h-[52px]"
                    style={{
                      background: "color-mix(in oklch, var(--foreground) 6%, transparent)",
                      border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)",
                    }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap + devise cible */}
              <div className="flex items-center gap-2">
                <button
                  onClick={swap}
                  className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-110 shrink-0"
                  style={{
                    background: "color-mix(in oklch, var(--gold-premium) 15%, transparent)",
                    color: "var(--gold-premium)",
                    border: "1px solid color-mix(in oklch, var(--gold-premium) 25%, transparent)",
                  }}
                  title="Inverser les devises"
                >
                  <ArrowLeftRight size={15} />
                </button>
                <div className="flex-1">
                  <select
                    value={toCode}
                    onChange={(e) => setToCode(e.target.value)}
                    className="w-full rounded-xl px-3 py-3 text-sm font-semibold appearance-none outline-none focus:ring-2 focus:ring-[var(--gold-premium)]"
                    style={{
                      background: "color-mix(in oklch, var(--foreground) 6%, transparent)",
                      border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)",
                    }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Résultat principal */}
              <div
                className="rounded-xl p-4 text-center"
                style={{
                  background: "color-mix(in oklch, var(--turquoise) 8%, var(--background))",
                  border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)",
                }}
              >
                {loading ? (
                  <div className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                    Chargement des taux…
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold" style={{ color: "var(--turquoise)" }}>
                      {result.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {symOf(toCode)}
                    </div>
                    <div className="text-xs mt-1.5 font-mono" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                      {flagOf(fromCode)} 1 {fromCode} = {fmtRate(unitRate(fromCode, toCode))} {toCode}
                      {"  ·  "}
                      {flagOf(toCode)} 1 {toCode} = {fmtRate(unitRate(toCode, fromCode))} {fromCode}
                    </div>
                  </>
                )}
              </div>

              {/* Grille toutes devises */}
              <div>
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}
                >
                  {numAmount.toLocaleString("fr-FR")} {fromCode} =
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allConversions.map((c) => (
                    <div
                      key={c.code}
                      className="rounded-xl px-3 py-2.5 flex items-center justify-between gap-2"
                      style={{
                        background:
                          c.code === toCode
                            ? "color-mix(in oklch, var(--turquoise) 10%, transparent)"
                            : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                        border: `1px solid ${
                          c.code === toCode
                            ? "color-mix(in oklch, var(--turquoise) 25%, transparent)"
                            : "color-mix(in oklch, var(--foreground) 7%, transparent)"
                        }`,
                      }}
                    >
                      <div>
                        <div className="text-[11px] font-bold flex items-center gap-1"
                          style={{ color: c.code === toCode ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                          {c.flag} {c.code}
                        </div>
                        <div className="text-[10px]" style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
                          {c.name}
                        </div>
                      </div>
                      <div
                        className="text-sm font-bold text-right tabular-nums"
                        style={{ color: c.code === toCode ? "var(--turquoise)" : "var(--foreground)" }}
                      >
                        {loading ? "…" : c.value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
                        <span className="text-[10px] ml-0.5 opacity-70">{c.symbol}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ ONGLET TAUX DE RÉFÉRENCE ══════════════════════════════════════ */}
          {tab === "rates" && (
            <div className="p-5 space-y-4">
              {error && (
                <div className="rounded-lg p-3 text-xs"
                  style={{ background: "color-mix(in oklch, #CFAE63 10%, transparent)", color: "#CFAE63", border: "1px solid color-mix(in oklch, #CFAE63 20%, transparent)" }}>
                  ⚠ {error}
                </div>
              )}

              {/* Sélecteur devise de référence */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold whitespace-nowrap"
                  style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                  Devise de référence :
                </label>
                <select
                  value={refBase}
                  onChange={(e) => setRefBase(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold appearance-none outline-none focus:ring-2 focus:ring-[var(--gold-premium)] flex-1"
                  style={{
                    background: "color-mix(in oklch, var(--gold-premium) 8%, var(--background))",
                    border: "1px solid color-mix(in oklch, var(--gold-premium) 25%, transparent)",
                    color: "var(--gold-premium)",
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Tableau des taux */}
              <div className="rounded-xl overflow-hidden"
                style={{ border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
                {/* En-tête */}
                <div className="grid grid-cols-3 px-4 py-2 text-[11px] font-bold"
                  style={{
                    background: "color-mix(in oklch, var(--gold-premium) 10%, var(--background))",
                    color: "var(--gold-premium)",
                    borderBottom: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)",
                  }}>
                  <span>Devise</span>
                  <span className="text-right">1 unité → {refBase}</span>
                  <span className="text-right">1 {refBase} →</span>
                </div>

                {/* Lignes */}
                {loading ? (
                  <div className="px-4 py-6 text-center text-sm"
                    style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                    Chargement des taux…
                  </div>
                ) : (
                  refRates.map((c, i) => (
                    <div
                      key={c.code}
                      className="grid grid-cols-3 px-4 py-3 items-center text-sm"
                      style={{
                        background: i % 2 === 0
                          ? "transparent"
                          : "color-mix(in oklch, var(--foreground) 2%, transparent)",
                        borderTop: i > 0 ? "1px solid color-mix(in oklch, var(--foreground) 5%, transparent)" : "none",
                      }}
                    >
                      {/* Devise */}
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{c.flag}</span>
                        <div>
                          <div className="font-bold text-xs">{c.code}</div>
                          <div className="text-[10px]" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                            {c.name}
                          </div>
                        </div>
                      </div>

                      {/* 1 CURRENCY → refBase */}
                      <div className="text-right font-mono">
                        <span className="font-bold" style={{ color: "var(--turquoise)" }}>
                          {fmtRate(c.rate)}
                        </span>
                        <span className="text-[10px] ml-1"
                          style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                          {symOf(refBase)}
                        </span>
                      </div>

                      {/* 1 refBase → CURRENCY */}
                      <div className="text-right font-mono">
                        <span className="font-bold" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                          {fmtRate(c.rateInverse)}
                        </span>
                        <span className="text-[10px] ml-1"
                          style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                          {c.symbol}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Note de bas de page */}
              <p className="text-[10px] text-center italic"
                style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
                Source : open.er-api.com · Actualisation automatique toutes les 30 min
                {lastSync && ` · Dernière maj : ${lastSync.toLocaleTimeString("fr-FR")}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
