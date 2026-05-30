"use client";
import { useState, useEffect } from "react";
import { Compass, Save, Loader2, Check, AlertCircle, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import MediaPicker from "@/app/components/MediaPicker";

interface NavLink { id: string; href: string; label: string; order: number; active: boolean; }
interface FooterSection { id: string; title: string; links: NavLink[]; order: number; active: boolean; }
interface SiteLogo { logoUrl: string; logoText: string; showText: boolean; }

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };
const F = "px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all border border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-[color-mix(in_oklch,var(--foreground)_3%,transparent)]";

function Toast({ ok, msg, onDone }: { ok: boolean; msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-xl"
      style={{ background: ok ? "var(--royal-blue)" : "rgb(239,68,68)" }}>
      {ok ? <Check size={16} /> : <AlertCircle size={16} />}{msg}
    </div>
  );
}

export default function AdminNavigation() {
  const [tab, setTab] = useState<"header"|"footer"|"logo">("header");
  const [headerLinks, setHeaderLinks] = useState<NavLink[]>([]);
  const [footerSections, setFooterSections] = useState<FooterSection[]>([]);
  const [logo, setLogo] = useState<SiteLogo>({ logoUrl: "", logoText: "", showText: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/navigation/header").then(r => r.ok ? r.json() : null),
      fetch("/api/admin/navigation/footer").then(r => r.ok ? r.json() : null),
      fetch("/api/admin/navigation/logo").then(r => r.ok ? r.json() : null),
    ]).then(([hdr, ftr, lg]) => {
      if (hdr) setHeaderLinks(hdr);
      else setHeaderLinks([
        { id:"1", href:"/", label:"Accueil", order:1, active:true },
        { id:"2", href:"/services", label:"Services", order:2, active:true },
        { id:"3", href:"/portfolio", label:"Portfolio", order:3, active:true },
        { id:"4", href:"/blog", label:"Blog", order:4, active:true },
        { id:"5", href:"/about", label:"À propos", order:5, active:true },
        { id:"6", href:"/contact", label:"Contact", order:6, active:true },
      ]);
      if (ftr) setFooterSections(ftr);
      else setFooterSections([{ id:"nav", title:"Navigation", links:[{ id:"f1", href:"/services", label:"Services", order:1, active:true }], order:1, active:true }]);
      if (lg) setLogo(lg);
      else setLogo({ logoUrl:"", logoText:"DIME GROUPE", showText:true });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const ep = tab === "header" ? "/api/admin/navigation/header" : tab === "footer" ? "/api/admin/navigation/footer" : "/api/admin/navigation/logo";
      const body = tab === "header" ? headerLinks : tab === "footer" ? footerSections : logo;
      const res = await fetch(ep, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setToast(res.ok ? { ok: true, msg: "Enregistré avec succès" } : { ok: false, msg: "Erreur enregistrement" });
    } catch { setToast({ ok: false, msg: "Erreur de connexion" }); }
    finally { setSaving(false); }
  };

  // ── Header link helpers ──
  const sortedHeader = [...headerLinks].sort((a, b) => a.order - b.order);
  const addHL = () => setHeaderLinks(prev => [...prev, { id: Date.now().toString(), href: "", label: "", order: (prev.length ? Math.max(...prev.map(l => l.order)) : 0) + 1, active: true }]);
  const delHL = (id: string) => setHeaderLinks(prev => prev.filter(l => l.id !== id));
  const updHL = (id: string, field: keyof NavLink, val: string | boolean | number) => setHeaderLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));
  const moveHL = (id: string, dir: "up"|"down") => {
    const idx = sortedHeader.findIndex(l => l.id === id);
    const arr = [...sortedHeader];
    if (dir === "up" && idx > 0) [arr[idx-1].order, arr[idx].order] = [arr[idx].order, arr[idx-1].order];
    if (dir === "down" && idx < arr.length-1) [arr[idx].order, arr[idx+1].order] = [arr[idx+1].order, arr[idx].order];
    setHeaderLinks(arr);
  };

  // ── Footer helpers ──
  const addFS = () => setFooterSections(prev => [...prev, { id: Date.now().toString(), title: "", links: [], order: (prev.length ? Math.max(...prev.map(s => s.order)) : 0) + 1, active: true }]);
  const delFS = (id: string) => setFooterSections(prev => prev.filter(s => s.id !== id));
  const updFS = (id: string, field: keyof FooterSection, val: unknown) => setFooterSections(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  const addFL = (sid: string) => setFooterSections(prev => prev.map(s => s.id === sid ? { ...s, links: [...s.links, { id: Date.now().toString(), href: "", label: "", order: (s.links.length ? Math.max(...s.links.map(l => l.order)) : 0) + 1, active: true }] } : s));
  const delFL = (sid: string, lid: string) => setFooterSections(prev => prev.map(s => s.id === sid ? { ...s, links: s.links.filter(l => l.id !== lid) } : s));
  const updFL = (sid: string, lid: string, field: keyof NavLink, val: string | boolean | number) => setFooterSections(prev => prev.map(s => s.id === sid ? { ...s, links: s.links.map(l => l.id === lid ? { ...l, [field]: val } : l) } : s));

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;

  return (
    <div className="space-y-5 max-w-3xl">
      {toast && <Toast ok={toast.ok} msg={toast.msg} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)" }}>
              <Compass size={16} strokeWidth={2} style={{ color: "var(--royal-blue)" }} />
            </div>
            <h1 className="text-2xl font-bold">Navigation & Logo</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            Menus header, footer et logo du site
          </p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-60"
          style={{ background: "var(--royal-blue)" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
        {([["header","📋","Header"], ["footer","📄","Footer"], ["logo","🎨","Logo"]] as const).map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: tab === id ? "var(--background)" : "transparent", color: tab === id ? "var(--foreground)" : "color-mix(in oklch, var(--foreground) 55%, transparent)", boxShadow: tab === id ? "0 1px 4px rgba(0,0,0,0.12)" : "none" }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── Header Tab ── */}
      {tab === "header" && (
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
            <div>
              <p className="text-sm font-semibold">Liens de navigation</p>
              <p className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>{headerLinks.length} lien{headerLinks.length > 1 ? "s" : ""}</p>
            </div>
            <button onClick={addHL} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--royal-blue)" }}>
              <Plus size={12} /> Ajouter
            </button>
          </div>
          <div className="divide-y p-3 space-y-1.5" style={{ "--tw-divide-color": "transparent" } as React.CSSProperties}>
            {sortedHeader.map((link, i) => (
              <div key={link.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)" }}>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveHL(link.id, "up")} disabled={i === 0} className="w-5 h-5 rounded flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-all">
                    <ChevronUp size={12} />
                  </button>
                  <button onClick={() => moveHL(link.id, "down")} disabled={i === sortedHeader.length-1} className="w-5 h-5 rounded flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-all">
                    <ChevronDown size={12} />
                  </button>
                </div>
                <input value={link.href} onChange={e => updHL(link.id, "href", e.target.value)} placeholder="/url" className={F + " w-36"} />
                <input value={link.label} onChange={e => updHL(link.id, "label", e.target.value)} placeholder="Label" className={F + " flex-1"} />
                <button onClick={() => updHL(link.id, "active", !link.active)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: link.active ? "color-mix(in oklch, #22c55e 10%, transparent)" : "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
                  {link.active ? <Eye size={13} style={{ color: "#16a34a" }} /> : <EyeOff size={13} style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }} />}
                </button>
                <button onClick={() => delHL(link.id)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}>
                  <Trash2 size={12} style={{ color: "#ef4444" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer Tab ── */}
      {tab === "footer" && (
        <div className="space-y-4">
          {footerSections.map(section => (
            <div key={section.id} className="rounded-2xl overflow-hidden" style={CARD}>
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
                <input value={section.title} onChange={e => updFS(section.id, "title", e.target.value)} placeholder="Titre de la colonne" className={F + " flex-1 font-semibold"} />
                <button onClick={() => addFL(section.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)", color: "var(--royal-blue)" }}>
                  <Plus size={11} /> Lien
                </button>
                <button onClick={() => delFS(section.id)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}>
                  <Trash2 size={12} style={{ color: "#ef4444" }} />
                </button>
              </div>
              <div className="p-3 space-y-2">
                {section.links.map(link => (
                  <div key={link.id} className="flex items-center gap-2">
                    <input value={link.href} onChange={e => updFL(section.id, link.id, "href", e.target.value)} placeholder="/url ou https://…" className={F + " w-44"} />
                    <input value={link.label} onChange={e => updFL(section.id, link.id, "label", e.target.value)} placeholder="Label" className={F + " flex-1"} />
                    <button onClick={() => updFL(section.id, link.id, "active", !link.active)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: link.active ? "color-mix(in oklch, #22c55e 10%, transparent)" : "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
                      {link.active ? <Eye size={12} style={{ color: "#16a34a" }} /> : <EyeOff size={12} style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }} />}
                    </button>
                    <button onClick={() => delFL(section.id, link.id)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}>
                      <Trash2 size={11} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                ))}
                {section.links.length === 0 && (
                  <p className="text-xs text-center py-3" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>Aucun lien — cliquez "Lien" pour ajouter</p>
                )}
              </div>
            </div>
          ))}
          <button onClick={addFS} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 border-dashed transition-all hover:scale-[1.01]"
            style={{ borderColor: "color-mix(in oklch, var(--foreground) 12%, transparent)", color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
            <Plus size={15} /> Nouvelle colonne footer
          </button>
        </div>
      )}

      {/* ── Logo Tab ── */}
      {tab === "logo" && (
        <div className="rounded-2xl p-5 space-y-5" style={CARD}>
          {/* Aperçu */}
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)" }}>
            {logo.logoUrl && <img src={logo.logoUrl} alt="Logo" className="h-10 w-auto object-contain rounded" />}
            {logo.showText && logo.logoText && (
              <span className="font-bold text-lg bg-gradient-to-r from-[var(--royal-blue)] to-[var(--gold-premium)] bg-clip-text text-transparent">
                {logo.logoText}
              </span>
            )}
            {!logo.logoUrl && !logo.logoText && <span className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>Aperçu du logo</span>}
          </div>
          {/* Champs */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>URL de l'image logo</label>
            <div className="flex gap-2">
              <input value={logo.logoUrl} onChange={e => setLogo(l => ({ ...l, logoUrl: e.target.value }))} placeholder="/dime-logo.png ou https://…" className={F + " flex-1"} />
              <button onClick={() => setMediaOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)", color: "var(--royal-blue)" }}>
                <ImageIcon size={13} /> Médiathèque
              </button>
            </div>
            {mediaOpen && <div className="mt-2"><MediaPicker value={logo.logoUrl} onChange={url => { setLogo(l => ({ ...l, logoUrl: url })); setMediaOpen(false); }} label="Logo" /></div>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>Texte du logo</label>
            <input value={logo.logoText} onChange={e => setLogo(l => ({ ...l, logoText: e.target.value }))} placeholder="DIME GROUPE" className={F + " w-full"} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" checked={logo.showText} onChange={e => setLogo(l => ({ ...l, showText: e.target.checked }))} className="sr-only" />
              <div className="w-10 h-6 rounded-full transition-all" style={{ background: logo.showText ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 18%, transparent)" }}>
                <div className="w-4 h-4 rounded-full bg-white shadow transition-all absolute top-1" style={{ left: logo.showText ? "calc(100% - 1.25rem)" : "0.25rem" }} />
              </div>
            </div>
            <span className="text-sm font-medium">Afficher le texte à côté du logo</span>
          </label>
        </div>
      )}
    </div>
  );
}
