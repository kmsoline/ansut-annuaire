"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Search, X, Check, Grid3X3, List, FolderOpen, Filter } from "lucide-react";

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  folder: string;
  folderLabel: string;
  size: number;
  ext: string;
  uploadedAt: string;
}

function fmtSize(b: number) {
  if (!b) return "0 o";
  const k = 1024, s = ["o","Ko","Mo","Go"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(1) + " " + s[i];
}

// ── Props ────────────────────────────────────────────────────────────────────

interface MediaPickerSingleProps {
  value?: string;
  onChange: (url: string) => void;
  multiple?: false;
  label?: string;
}
interface MediaPickerMultiProps {
  values?: string[];
  onMultiChange: (urls: string[]) => void;
  multiple: true;
  label?: string;
}
type MediaPickerProps = MediaPickerSingleProps | MediaPickerMultiProps;

export default function MediaPicker(props: MediaPickerProps) {
  const { label = "Image" } = props;
  const isMulti = props.multiple === true;

  const currentValue  = !isMulti ? (props as MediaPickerSingleProps).value  : undefined;
  const currentValues = isMulti  ? (props as MediaPickerMultiProps).values ?? [] : [];

  const [open,       setOpen]       = useState(false);
  const [files,      setFiles]      = useState<MediaFile[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [search,     setSearch]     = useState("");
  const [folder,     setFolder]     = useState("all");
  const [viewMode,   setViewMode]   = useState<"grid" | "list">("grid");
  const [selected,   setSelected]   = useState<string[]>(
    isMulti ? currentValues : (currentValue ? [currentValue] : [])
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) setFiles(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (open) loadFiles(); }, [open, loadFiles]);

  // Sync selection when modal opens
  useEffect(() => {
    if (open) {
      setSelected(isMulti ? currentValues : (currentValue ? [currentValue] : []));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const uploadFiles = async (fl: FileList | File[]) => {
    const arr = Array.from(fl).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      arr.forEach((f) => form.append("files", f));
      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      if (res.ok) await loadFiles();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggle = (url: string) => {
    if (isMulti) {
      setSelected((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    } else {
      setSelected([url]);
    }
  };

  const confirm = () => {
    if (isMulti) {
      (props as MediaPickerMultiProps).onMultiChange(selected);
    } else {
      if (selected[0]) (props as MediaPickerSingleProps).onChange(selected[0]);
    }
    setOpen(false);
  };

  const folders = Array.from(new Map(files.map((f) => [f.folder, f.folderLabel])).entries());
  const filtered = files.filter((f) => {
    const ms = !search || f.filename.toLowerCase().includes(search.toLowerCase());
    const mf = folder === "all" || f.folder === folder;
    return ms && mf;
  });

  return (
    <div>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}

      {/* ── Single mode preview ─────────────────────────────────────────── */}
      {!isMulti && (
        <div className="flex items-center gap-3">
          {currentValue && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0">
              <Image src={currentValue} alt="Preview" fill sizes="80px" className="object-cover" />
            </div>
          )}
          <input
            type="text"
            value={currentValue || ""}
            onChange={(e) => (props as MediaPickerSingleProps).onChange(e.target.value)}
            placeholder="/images/example.jpg"
            className="flex-1 px-3 py-2.5 rounded-lg text-sm border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)", color: "var(--royal-blue)", border: "1px solid color-mix(in oklch, var(--royal-blue) 25%, transparent)" }}
          >
            <Grid3X3 size={14} /> Médiathèque
          </button>
        </div>
      )}

      {/* ── Multi mode preview ──────────────────────────────────────────── */}
      {isMulti && (
        <div className="space-y-2">
          {currentValues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentValues.map((url) => (
                <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                  <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => (props as MediaPickerMultiProps).onMultiChange(currentValues.filter((u) => u !== url))}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)", color: "var(--royal-blue)", border: "1px solid color-mix(in oklch, var(--royal-blue) 25%, transparent)" }}
          >
            <Grid3X3 size={14} />
            {currentValues.length > 0 ? `Gérer les images (${currentValues.length})` : "Choisir des images"}
          </button>
        </div>
      )}

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass glass-strong rounded-2xl flex flex-col w-full max-w-5xl"
            style={{ height: "min(90vh, 700px)", border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-lg font-bold">
                  {isMulti ? "Sélection multiple" : "Choisir une image"}
                </h3>
                {isMulti && selected.length > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--royal-blue)" }}>
                    {selected.length} image{selected.length > 1 ? "s" : ""} sélectionnée{selected.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Upload */}
                <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:scale-105 text-white ${uploading ? "opacity-60" : ""}`}
                  style={{ background: "var(--royal-blue)" }}>
                  <Upload size={14} />
                  {uploading ? "Envoi…" : "Téléverser"}
                  <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                    disabled={uploading} onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
                </label>
                <button onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-white/10 shrink-0">
              {/* Search */}
              <div className="relative flex-1 min-w-40">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--royal-blue)]"
                  style={{ background: "color-mix(in oklch, var(--foreground) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }} />
              </div>
              {/* Folder filter */}
              {folders.length > 0 && (
                <div className="relative">
                  <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
                  <select value={folder} onChange={(e) => setFolder(e.target.value)}
                    className="pl-7 pr-6 py-1.5 rounded-lg text-sm appearance-none outline-none cursor-pointer focus:ring-2 focus:ring-[var(--royal-blue)]"
                    style={{ background: "color-mix(in oklch, var(--foreground) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}>
                    <option value="all">Tous les dossiers</option>
                    {folders.map(([f, l]) => <option key={f} value={f}>{l}</option>)}
                  </select>
                </div>
              )}
              {/* View toggle */}
              <div className="flex rounded-lg overflow-hidden"
                style={{ border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}>
                <button onClick={() => setViewMode("grid")} className="p-1.5 transition-colors"
                  style={{ background: viewMode === "grid" ? "color-mix(in oklch, var(--royal-blue) 15%, transparent)" : "transparent", color: viewMode === "grid" ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                  <Grid3X3 size={15} />
                </button>
                <button onClick={() => setViewMode("list")} className="p-1.5 transition-colors"
                  style={{ background: viewMode === "list" ? "color-mix(in oklch, var(--royal-blue) 15%, transparent)" : "transparent", color: viewMode === "list" ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                  <List size={15} />
                </button>
              </div>
              <span className="text-xs ml-auto" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                {filtered.length} fichier{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Grid / List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 rounded-full border-2 animate-spin"
                    style={{ borderColor: "var(--royal-blue)", borderTopColor: "transparent" }} />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center gap-3"
                  style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                  <FolderOpen size={36} strokeWidth={1.5} />
                  <p className="text-sm">
                    {search ? "Aucun résultat" : "Aucune image — utilisez le bouton Téléverser"}
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filtered.map((f) => {
                    const isSelected = selected.includes(f.url);
                    return (
                      <button key={f.id} type="button" onClick={() => toggle(f.url)}
                        className={`relative rounded-xl overflow-hidden transition-all duration-150 hover:scale-[1.03] text-left ${
                          isSelected ? "ring-2 ring-[var(--royal-blue)] ring-offset-1" : ""
                        }`}
                        style={{ background: "color-mix(in oklch, var(--foreground) 4%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
                        <div className="aspect-square relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.url} alt={f.filename} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center"
                              style={{ background: "color-mix(in oklch, var(--royal-blue) 35%, transparent)" }}>
                              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ background: "var(--royal-blue)" }}>
                                <Check size={14} strokeWidth={2.5} className="text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="px-2 py-1.5">
                          <p className="text-[10px] truncate font-medium" title={f.filename}>{f.filename}</p>
                          <p className="text-[9px]" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
                            {fmtSize(f.size)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
                  {filtered.map((f, i) => {
                    const isSelected = selected.includes(f.url);
                    return (
                      <div key={f.id} onClick={() => toggle(f.url)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                        style={{
                          borderTop: i > 0 ? "1px solid color-mix(in oklch, var(--foreground) 5%, transparent)" : undefined,
                          background: isSelected ? "color-mix(in oklch, var(--royal-blue) 8%, transparent)" : undefined,
                        }}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                          style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.url} alt={f.filename} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{f.filename}</p>
                          <p className="text-xs flex items-center gap-1.5"
                            style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                            <span className="uppercase font-bold text-[10px]" style={{ color: "var(--royal-blue)", opacity: 0.8 }}>{f.ext}</span>
                            · {fmtSize(f.size)}
                            {f.folderLabel && <><span>·</span><FolderOpen size={10} />{f.folderLabel}</>}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: "var(--royal-blue)" }}>
                            <Check size={11} strokeWidth={2.5} className="text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/10 shrink-0">
              <button onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-white/10"
                style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
                Annuler
              </button>
              <button onClick={confirm} disabled={selected.length === 0}
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: "var(--royal-blue)" }}>
                <Check size={14} strokeWidth={2.5} />
                {isMulti
                  ? selected.length > 0 ? `Confirmer (${selected.length})` : "Sélectionner"
                  : "Confirmer la sélection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
