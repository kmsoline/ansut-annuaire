"use client";

import { useState } from "react";

const EXPORT_TYPES = [
  { value: "all", label: "Tout exporter" },
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

export default function AdminExport() {
  const [exportType, setExportType] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    setIsExporting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/export?type=${exportType}`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `export-${exportType}-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        setMessage("Export réussi !");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Erreur lors de l'export");
      }
    } catch (error) {
      setMessage("Une erreur est survenue");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Export de données</h1>
        <p className="text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          Exportez les données du site au format JSON
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
            Type d'export *
          </label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          >
            {EXPORT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm">
          <p className="font-semibold mb-1">⚠️ Important</p>
          <p>
            L'export contient toutes les données du type sélectionné. Vous pouvez utiliser ce fichier
            pour sauvegarder ou restaurer vos données.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? "Export en cours..." : "📥 Exporter"}
          </button>
        </div>
      </div>
    </div>
  );
}


