"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Upload, Search, Grid3X3, List, X, Copy, Trash2, ExternalLink,
  ImageIcon, FolderOpen, Filter, Check,
} from "lucide-react";

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  folder: string;
  folderLabel: string;
  size: number;
  ext: string;
  uploadedAt: string;
  deletable: boolean;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 o";
  const k = 1024;
  const sizes = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-xl"
      style={{ background: "var(--royal-blue)" }}>
      <Check size={16} />
      {message}
    </div>
  );
}

// ─── Miniature ───────────────────────────────────────────────────────────────
function Thumb({ file, selected, onClick }: { file: MediaFile; selected: boolean; onClick: () => void }) {
  const isSvg = file.ext === "svg";
  return (
    <div onClick={onClick}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? "ring-2 ring-offset-1 ring-[var(--royal-blue)]" : ""
      }`}
      style={{ background: "color-mix(in oklch, var(--background) 80%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
      {/* Image */}
      <div className="aspect-square relative overflow-hidden flex items-center justify-center"
        style={{ background: "color-mix(in oklch, var(--foreground) 4%, transparent)" }}>
        {isSvg ? (
          <img src={file.url} alt={file.filename} className="w-3/4 h-3/4 object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
          style={{ background: "color-mix(in oklch, var(--royal-blue) 20%, transparent)" }}>
          {selected && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "var(--royal-blue)" }}>
              <Check size={11} strokeWidth={2.5} className="text-white" />
            </div>
          )}
        </div>
      </div>
      {/* Infos */}
      <div className="p-2.5">
        <p className="text-xs font-medium truncate" title={file.filename}>{file.filename}</p>
        <p className="text-[10px] mt-0.5 flex items-center gap-1"
          style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
          <span className="uppercase font-semibold" style={{ color: "var(--royal-blue)", opacity: 0.8 }}>{file.ext}</span>
          · {formatSize(file.size)}
        </p>
      </div>
    </div>
  );
}

// ─── Panneau de détail ────────────────────────────────────────────────────────
function DetailPanel({
  file,
  onClose,
  onDelete,
  onCopy,
}: {
  file: MediaFile;
  onClose: () => void;
  onDelete: (id: string) => void;
  onCopy: (url: string) => void;
}) {
  const isSvg = file.ext === "svg";
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${file.url}` : file.url;

  return (
    <aside className="fixed right-0 top-0 h-full w-80 z-40 flex flex-col shadow-2xl"
      style={{ background: "var(--background)", borderLeft: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
        <span className="font-semibold text-sm">Détails du fichier</span>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Aperçu */}
      <div className="flex items-center justify-center p-6"
        style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)", borderBottom: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
        {isSvg ? (
          <img src={file.url} alt={file.filename} className="max-h-48 max-w-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.url} alt={file.filename} className="max-h-48 max-w-full object-contain rounded-lg" />
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>Nom du fichier</p>
          <p className="text-sm font-medium break-all">{file.filename}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>URL</p>
          <p className="text-xs break-all font-mono rounded px-2 py-1.5"
            style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)", color: "var(--royal-blue)" }}>
            {file.url}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>Type</p>
            <p className="text-sm uppercase font-semibold">{file.ext}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>Taille</p>
            <p className="text-sm">{formatSize(file.size)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>Dossier</p>
            <p className="text-xs">{file.folderLabel}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>Date</p>
            <p className="text-xs">{formatDate(file.uploadedAt)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 space-y-2.5"
        style={{ borderTop: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
        <button onClick={() => onCopy(file.url)}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "var(--royal-blue)" }}>
          <Copy size={15} /> Copier l&apos;URL
        </button>
        <a href={file.url} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:bg-white/10"
          style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
          <ExternalLink size={15} /> Ouvrir dans un onglet
        </a>
        {file.deletable && (
          <button onClick={() => onDelete(file.id)}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:bg-red-500/20"
            style={{ color: "rgb(239 68 68)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <Trash2 size={15} /> Supprimer
          </button>
        )}
        {!file.deletable && (
          <p className="text-center text-[10px]"
            style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
            Fichier statique — non supprimable depuis l&apos;admin
          </p>
        )}
      </div>
    </aside>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) setFiles(await res.json());
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const uploadFiles = async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    setIsUploading(true);
    try {
      const form = new FormData();
      arr.forEach((f) => form.append("files", f));
      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      if (res.ok) {
        await loadFiles();
        setToast(`${arr.length} image${arr.length > 1 ? "s" : ""} ajoutée${arr.length > 1 ? "s" : ""}`);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce fichier définitivement ?")) return;
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setSelected(null);
      setToast("Fichier supprimé");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => setToast("URL copiée !"));
  };

  // Drag & drop
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  };

  // Dossiers uniques pour le filtre
  const folders = Array.from(new Map(files.map((f) => [f.folder, f.folderLabel])).entries());

  // Filtrage
  const filtered = files.filter((f) => {
    const matchSearch = search === "" || f.filename.toLowerCase().includes(search.toLowerCase());
    const matchFolder = folderFilter === "all" || f.folder === folderFilter;
    return matchSearch && matchFolder;
  });

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--royal-blue)]" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${selected ? "mr-80" : ""} transition-all duration-300`}>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Médiathèque</h1>
          <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
            {files.length} fichier{files.length > 1 ? "s" : ""} · {formatSize(totalSize)} utilisés
          </p>
        </div>
        <label className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-all hover:scale-105 ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: "linear-gradient(135deg, var(--royal-blue), color-mix(in oklch, var(--royal-blue) 70%, var(--gold-premium)))" }}>
          <Upload size={15} />
          {isUploading ? "Envoi en cours…" : "Ajouter des images"}
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
            disabled={isUploading} onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
        </label>
      </div>

      {/* Zone Drag & Drop */}
      <div
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        className="rounded-2xl border-2 border-dashed transition-all duration-200 p-6 text-center"
        style={{
          borderColor: isDragging ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 15%, transparent)",
          background: isDragging ? "color-mix(in oklch, var(--royal-blue) 6%, transparent)" : "transparent",
        }}>
        <Upload size={24} className="mx-auto mb-2" style={{ color: isDragging ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 30%, transparent)" }} />
        <p className="text-sm font-medium" style={{ color: isDragging ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
          {isDragging ? "Déposez vos images ici" : "Glissez-déposez des images ici, ou utilisez le bouton ci-dessus"}
        </p>
        <p className="text-xs mt-1" style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
          JPG, PNG, WebP, GIF, SVG — illimité
        </p>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Recherche */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom…"
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)]"
            style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}
          />
        </div>

        {/* Filtre dossier */}
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
          <select value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)}
            className="pl-8 pr-8 py-2 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] cursor-pointer"
            style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}>
            <option value="all">Tous les dossiers</option>
            {folders.map(([folder, label]) => (
              <option key={folder} value={folder}>{label}</option>
            ))}
          </select>
        </div>

        {/* Vue grille/liste */}
        <div className="flex items-center rounded-lg overflow-hidden"
          style={{ border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}>
          <button onClick={() => setViewMode("grid")}
            className="p-2 transition-colors"
            style={{ background: viewMode === "grid" ? "color-mix(in oklch, var(--royal-blue) 15%, transparent)" : "transparent", color: viewMode === "grid" ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setViewMode("list")}
            className="p-2 transition-colors"
            style={{ background: viewMode === "list" ? "color-mix(in oklch, var(--royal-blue) 15%, transparent)" : "transparent", color: viewMode === "list" ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            <List size={16} />
          </button>
        </div>

        <span className="text-xs ml-auto" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
          {filtered.length} / {files.length} fichier{files.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Contenu */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-16 text-center"
          style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
          <ImageIcon size={40} className="mx-auto mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 20%, transparent)" }} />
          <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {search || folderFilter !== "all" ? "Aucun résultat pour cette recherche" : "Aucun fichier — glissez des images ou utilisez le bouton Upload"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* VUE GRILLE */
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((file) => (
            <Thumb key={file.id} file={file} selected={selected?.id === file.id}
              onClick={() => setSelected(selected?.id === file.id ? null : file)} />
          ))}
        </div>
      ) : (
        /* VUE LISTE */
        <div className="rounded-xl overflow-hidden"
          style={{ border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "color-mix(in oklch, var(--foreground) 4%, transparent)", borderBottom: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Fichier</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Dossier</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Taille</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((file, i) => (
                <tr key={file.id}
                  className="cursor-pointer transition-colors hover:bg-white/5"
                  style={{ borderTop: i > 0 ? "1px solid color-mix(in oklch, var(--foreground) 5%, transparent)" : undefined, background: selected?.id === file.id ? "color-mix(in oklch, var(--royal-blue) 6%, transparent)" : undefined }}
                  onClick={() => setSelected(selected?.id === file.id ? null : file)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                        style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                        {file.ext === "svg" ? (
                          <img src={file.url} alt={file.filename} className="w-8 h-8 object-contain" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="font-medium truncate max-w-48" title={file.filename}>{file.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                      <FolderOpen size={12} />{file.folderLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded"
                      style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)", color: "var(--royal-blue)" }}>
                      {file.ext}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                    {formatSize(file.size)}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                    {formatDate(file.uploadedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleCopy(file.url); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Copier l'URL">
                        <Copy size={13} />
                      </button>
                      {file.deletable && (
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500" title="Supprimer">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Panneau de détail */}
      {selected && (
        <DetailPanel
          file={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />
      )}
    </div>
  );
}
