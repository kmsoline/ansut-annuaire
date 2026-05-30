"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const IMPORT_TYPES = [
  { value: "all", label: "Tout importer" },
  { value: "blog", label: "Articles de blog" },
  { value: "portfolio", label: "Projets portfolio" },
  { value: "services", label: "Services" },
  { value: "faq", label: "FAQ" },
  { value: "testimonials", label: "Témoignages" },
  { value: "client-logos", label: "Logos clients" },
  { value: "homepage", label: "Page d'accueil" },
  { value: "about", label: "Page À propos" },
  { value: "legal", label: "Pages légales" },
  { value: "afrinomade", label: "AfriNomade" },
  { value: "metadata", label: "SEO & Métadonnées" },
  { value: "navigation", label: "Navigation" },
];

export default function AdminImport() {
  const router = useRouter();
  const [importType, setImportType] = useState("all");
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage("Veuillez sélectionner un fichier");
      return;
    }

    setIsImporting(true);
    setMessage("");

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: importType, ...data }),
      });

      if (response.ok) {
        setMessage("Import réussi ! Redirection...");
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Erreur lors de l'import");
      }
    } catch (error) {
      setMessage("Erreur lors de la lecture du fichier. Vérifiez que c'est un fichier JSON valide.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Import de données</h1>
        <p className="text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          Importez des données depuis un fichier JSON
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.includes("réussi")
              ? "bg-green-500/10 border border-green-500/20 text-green-500"
              : "bg-red-500/10 border border-red-500/20 text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <div className="glass glass-strong rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Type d'import *
          </label>
          <select
            value={importType}
            onChange={(e) => setImportType(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          >
            {IMPORT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Fichier JSON *
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all text-sm"
          />
        </div>

        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <p className="font-semibold mb-1">⚠️ Attention</p>
          <p>
            L'import remplacera toutes les données existantes du type sélectionné. Assurez-vous d'avoir
            fait un export avant d'importer.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
          <button
            onClick={handleImport}
            disabled={isImporting || !file}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? "Import en cours..." : "📥 Importer"}
          </button>
        </div>
      </div>
    </div>
  );
}


