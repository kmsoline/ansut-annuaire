"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Sparkles, Save, Loader2, Check, Link2, Image as ImageIcon, X, Upload } from "lucide-react";
import type { SiteIcons, IconSlot } from "@/app/api/admin/icons/route";
import MediaPicker from "@/app/components/MediaPicker";

// ── Catalogue d'emoji par catégorie ──────────────────────────────────────────

const EMOJI_CATS = [
  { label: "Processus & actions",  emojis: ["🔍","🔎","📋","📌","📍","✅","☑️","🗂️","📁","📂","📝","✏️","🖊️","🔑","🗝️","⚙️","🔧","🔨","🛠️","📐","📏","🗃️","🗄️","📎","🖇️","✂️","🗑️","📤","📥","📦","📫","📬","📭","📮"] },
  { label: "Stratégie & objectifs",emojis: ["🎯","🎖️","🏆","🥇","🌟","⭐","💎","👑","🏅","🎗️","🏁","🚩","💡","🔭","🧭","🌐","🗺️","🎪","🎭","🥊","🏋️","⚔️","🛡️","🏹","🎲","♟️","🃏","🎴","🎰","🧩"] },
  { label: "Digital & tech",       emojis: ["💻","🖥️","📱","⌨️","🖱️","🖨️","📡","🔌","💾","💿","📀","🧩","🤖","🧠","⚡","🔋","🛡️","🔐","🔒","🌩️","☁️","🛰️","📶","🔭","🔬","⚗️","🧪","🧫","🧬","🔮","💊","🩺","🩻"] },
  { label: "Croissance & business", emojis: ["📈","📊","💰","💵","💳","🏦","💹","🤝","🫱","👥","🧑‍💼","👨‍💼","👩‍💼","🏢","🏗️","🌍","🚀","🛸","✈️","🚂","🏎️","⛵","🚁","🌏","🌎","🗼","🏛️","🏰","🏯","🗽","🗿","🏟️"] },
  { label: "Créativité & design",  emojis: ["🎨","🖌️","✏️","📐","📏","🎭","🎬","📸","📷","🎥","🎤","🎵","🎶","🪄","✨","💫","🌈","🎠","🎡","🎢","🎪","🎻","🎸","🥁","🪘","🎹","🎺","🪕","🎷","🪗","🎙️","🎚️","🎛️"] },
  { label: "Nature & environnement",emojis: ["🌱","🌿","🍀","🌳","🌲","🌴","🌵","🌸","🌺","🌻","🌞","🌊","🏔️","⛰️","🗻","🌋","🏝️","🌅","☀️","🌙","🌟","💧","🔥","🌬️","❄️","⛄","🌪️","🌈","⭐","🌠","🌌","🪐","🌍"] },
  { label: "Personnes & équipe",   emojis: ["👤","👥","🧑","👩","👨","🧑‍💻","👩‍💻","👨‍💻","🧑‍🎨","👩‍🎨","👨‍🎨","🧑‍🏫","👩‍🏫","👨‍🏫","🤗","🫶","👏","🙌","✌️","🤜","🤛","💪","🦾","🧠","👁️","❤️","🫀","🫁","🦷","🦴","👣","🫂"] },
  { label: "Formes & symboles",    emojis: ["✓","✔️","❌","⭕","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🔶","🔷","🔸","🔹","🔺","🔻","💠","🔘","🔲","🔳","▪️","▫️","◾","◽","◼️","◻️","⬛","⬜","🔅","🔆","❇️"] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isImageUrl(v: string) {
  return v.startsWith("/") || v.startsWith("http://") || v.startsWith("https://");
}

function IconDisplay({ icon, size = 36 }: { icon: string; size?: number }) {
  if (isImageUrl(icon)) {
    return <img src={icon} alt="" style={{ width: size, height: size, objectFit: "contain" }} />;
  }
  return <span style={{ fontSize: size * 0.75 }} className="select-none leading-none">{icon}</span>;
}

// ── Picker panel ─────────────────────────────────────────────────────────────

type PickerMode = "emoji" | "url" | "media";

interface PickerProps {
  slot: IconSlot;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

function Picker({ slot, onSelect, onClose }: PickerProps) {
  const [mode, setMode] = useState<PickerMode>("emoji");
  const [urlInput, setUrlInput] = useState(isImageUrl(slot.icon) ? slot.icon : "");
  const [customEmoji, setCustomEmoji] = useState(!isImageUrl(slot.icon) ? slot.icon : "");
  const [mediaOpen, setMediaOpen] = useState(false);

  return (
    <div
      className="fixed bottom-0 left-0 lg:left-64 right-0 z-50 border-t shadow-2xl"
      style={{
        background: "color-mix(in oklch, var(--background) 97%, transparent)",
        backdropFilter: "blur(28px)",
        borderColor: "color-mix(in oklch, var(--foreground) 10%, transparent)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-4 lg:px-6 lg:pt-4 lg:pb-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)" }}>
              <IconDisplay icon={slot.icon} size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Modifier : {slot.label}</p>
              <p className="text-xs text-[color-mix(in_oklch,var(--foreground)_45%,transparent)] truncate">{slot.section}</p>
            </div>
          </div>

          {/* Tabs mode */}
          <div className="flex items-center gap-1 shrink-0">
            {([
              { id: "emoji" as PickerMode, label: "Emoji",    Icon: Sparkles },
              { id: "url"   as PickerMode, label: "URL",      Icon: Link2 },
              { id: "media" as PickerMode, label: "Média",    Icon: ImageIcon },
            ] as const).map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setMode(id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: mode === id ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 6%, transparent)",
                  color: mode === id ? "#fff" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                }}>
                <Icon size={11} />
                {label}
              </button>
            ))}
            <button onClick={onClose} className="ml-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Mode Emoji ── */}
        {mode === "emoji" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <input
                value={customEmoji}
                onChange={e => setCustomEmoji(e.target.value)}
                placeholder="Tapez ou collez un emoji…"
                maxLength={8}
                className="flex-1 max-w-xs px-3 py-1.5 rounded-lg border text-sm outline-none"
                style={{
                  background: "color-mix(in oklch, var(--foreground) 5%, transparent)",
                  borderColor: "color-mix(in oklch, var(--foreground) 12%, transparent)",
                  color: "var(--foreground)",
                }}
              />
              <button
                onClick={() => customEmoji.trim() && onSelect(customEmoji.trim())}
                disabled={!customEmoji.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-40"
                style={{ background: "var(--royal-blue)" }}>
                Appliquer
              </button>
            </div>
            <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
              {EMOJI_CATS.map(cat => (
                <div key={cat.label}>
                  <p className="text-[9px] uppercase tracking-widest mb-1 font-semibold"
                    style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>
                    {cat.label}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cat.emojis.map(e => (
                      <button key={e} onClick={() => onSelect(e)} title={e}
                        className="w-8 h-8 text-lg rounded-lg flex items-center justify-center transition-all duration-100 hover:scale-125"
                        style={{ background: "color-mix(in oklch, var(--foreground) 4%, transparent)" }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Mode URL ── */}
        {mode === "url" && (
          <div className="space-y-3">
            <p className="text-xs text-[color-mix(in_oklch,var(--foreground)_55%,transparent)]">
              Collez l'URL d'une image (PNG, SVG, WebP…) ou un chemin relatif (/images/icon.png)
            </p>
            <div className="flex gap-2">
              <input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://... ou /images/mon-icone.svg"
                className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                style={{
                  background: "color-mix(in oklch, var(--foreground) 5%, transparent)",
                  borderColor: "color-mix(in oklch, var(--foreground) 12%, transparent)",
                  color: "var(--foreground)",
                }}
              />
              <button
                onClick={() => urlInput.trim() && onSelect(urlInput.trim())}
                disabled={!urlInput.trim()}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
                style={{ background: "var(--royal-blue)" }}>
                Appliquer
              </button>
            </div>
            {urlInput && isImageUrl(urlInput) && (
              <div className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)", borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
                <img src={urlInput} alt="aperçu" className="w-10 h-10 object-contain rounded" onError={e => (e.currentTarget.style.display = "none")} />
                <span className="text-xs text-[color-mix(in_oklch,var(--foreground)_55%,transparent)] truncate flex-1">{urlInput}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Mode Médiathèque ── */}
        {mode === "media" && (
          <div className="space-y-3">
            <p className="text-xs text-[color-mix(in_oklch,var(--foreground)_55%,transparent)]">
              Choisissez une image depuis la médiathèque du site
            </p>
            {!mediaOpen ? (
              <button
                onClick={() => setMediaOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--royal-blue)" }}>
                <ImageIcon size={15} />
                Ouvrir la médiathèque
              </button>
            ) : (
              <MediaPicker
                value={slot.icon.startsWith("/") || slot.icon.startsWith("http") ? slot.icon : ""}
                onChange={url => { onSelect(url); setMediaOpen(false); }}
                label="Choisir une icône"
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function AdminIconsPage() {
  const [icons, setIcons] = useState<SiteIcons | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<string | null>(null); // key du slot

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/icons");
        if (res.ok) setIcons(await res.json());
      } finally { setLoading(false); }
    })();
  }, []);

  const updateIcon = useCallback((key: string, icon: string) => {
    setIcons(prev => {
      if (!prev) return prev;
      return { slots: prev.slots.map(s => s.key === key ? { ...s, icon } : s) };
    });
    setEditing(null);
  }, []);

  const handleSave = async () => {
    if (!icons) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/icons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(icons),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-[var(--royal-blue)]" />
    </div>
  );
  if (!icons) return (
    <div className="text-center py-20 text-sm text-[color-mix(in_oklch,var(--foreground)_50%,transparent)]">
      Impossible de charger les icônes.
    </div>
  );

  // Grouper les slots par section
  const grouped: Record<string, IconSlot[]> = {};
  for (const slot of icons.slots) {
    if (!grouped[slot.section]) grouped[slot.section] = [];
    grouped[slot.section].push(slot);
  }

  const editingSlot = editing ? icons.slots.find(s => s.key === editing) ?? null : null;

  return (
    <div className="max-w-5xl space-y-6 pb-96">

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Sparkles size={20} className="text-[var(--gold-premium)]" />
            <h1 className="text-2xl font-bold">Icônes du site</h1>
          </div>
          <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_55%,transparent)]">
            Toutes les icônes utilisées sur le site, classées par page et section. Cliquez sur une icône pour la modifier.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 shrink-0"
          style={{ background: saved ? "#16a34a" : "var(--royal-blue)" }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? "Enregistrement…" : saved ? "Enregistré !" : "Enregistrer tout"}
        </button>
      </div>

      {/* Info */}
      <div className="px-4 py-3 rounded-xl text-xs"
        style={{
          background: "color-mix(in oklch, var(--royal-blue) 7%, transparent)",
          border: "1px solid color-mix(in oklch, var(--royal-blue) 20%, transparent)",
          color: "color-mix(in oklch, var(--foreground) 70%, transparent)",
        }}>
        💡 Chaque icône peut être un <strong>emoji</strong>, une <strong>image de la médiathèque</strong>, ou une <strong>URL externe</strong>.
        Les icônes des services sont éditables depuis <strong>Admin → Services</strong>.
      </div>

      {/* Sections */}
      {Object.entries(grouped).map(([sectionName, slots]) => (
        <div key={sectionName}
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "color-mix(in oklch, var(--background) 80%, transparent)",
            borderColor: "color-mix(in oklch, var(--foreground) 9%, transparent)",
          }}>
          {/* Header section */}
          <div className="px-5 py-3.5 border-b flex items-center justify-between"
            style={{ borderColor: "color-mix(in oklch, var(--foreground) 7%, transparent)" }}>
            <div>
              <h2 className="font-semibold text-sm">{sectionName}</h2>
              <p className="text-[11px] text-[color-mix(in_oklch,var(--foreground)_45%,transparent)] mt-0.5">
                {slots.length} icône{slots.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Grille de slots */}
          <div className="p-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {slots.map(slot => {
              const isEditing = editing === slot.key;
              return (
                <div key={slot.key} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setEditing(isEditing ? null : slot.key)}
                    className="relative w-full aspect-square rounded-2xl flex items-center justify-center border transition-all duration-200 group overflow-hidden"
                    style={{
                      background: isEditing
                        ? "color-mix(in oklch, var(--royal-blue) 10%, transparent)"
                        : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                      borderColor: isEditing
                        ? "color-mix(in oklch, var(--royal-blue) 45%, transparent)"
                        : "color-mix(in oklch, var(--foreground) 10%, transparent)",
                    }}
                    title="Cliquer pour modifier"
                  >
                    <span className="transition-transform duration-200 group-hover:scale-110">
                      <IconDisplay icon={slot.icon} size={32} />
                    </span>
                    <span
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[9px] font-bold tracking-wide"
                      style={{
                        background: "color-mix(in oklch, var(--royal-blue) 85%, transparent)",
                        color: "#fff",
                      }}>
                      MODIFIER
                    </span>
                  </button>
                  <span className="text-[10px] text-center leading-tight line-clamp-2"
                    style={{ color: "color-mix(in oklch, var(--foreground) 58%, transparent)" }}>
                    {slot.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Picker fixe en bas */}
      {editingSlot && (
        <Picker
          slot={editingSlot}
          onSelect={icon => updateIcon(editingSlot.key, icon)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
