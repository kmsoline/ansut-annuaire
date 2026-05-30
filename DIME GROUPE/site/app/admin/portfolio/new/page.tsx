"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaPicker from "@/app/components/MediaPicker";

export default function NewPortfolioItem() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    tag: "",
    category: "",
    description: "",
    longDescription: "",
    year: "",
    img: "",
    sector: "",
    technologies: [] as string[],
    deliverables: [] as string[],
    results: [] as string[],
    published: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    if (name === "title") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleArrayInput = (field: "technologies" | "deliverables" | "results", index: number, value: string) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: "technologies" | "deliverables" | "results") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field: "technologies" | "deliverables" | "results", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/portfolio");
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la création");
      }
    } catch (error) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Nouveau projet</h1>
        <p className="text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          Ajoutez un nouveau projet au portfolio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass glass-strong rounded-xl p-6 space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Titre *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-2">
            Slug (URL) *
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tag" className="block text-sm font-medium mb-2">
              Tag *
            </label>
            <input
              id="tag"
              name="tag"
              type="text"
              value={formData.tag}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
              placeholder="Web, Mobile, Design..."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Catégorie *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="Développement">Développement</option>
              <option value="Communication">Communication</option>
              <option value="Événementiel">Événementiel</option>
              <option value="Tourisme">Tourisme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description courte *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all resize-none"
            placeholder="Description courte du projet"
          />
        </div>

        <div>
          <label htmlFor="longDescription" className="block text-sm font-medium mb-2">
            Description détaillée *
          </label>
          <textarea
            id="longDescription"
            name="longDescription"
            value={formData.longDescription}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all resize-none"
            placeholder="Description détaillée du projet"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="year" className="block text-sm font-medium mb-2">
              Année *
            </label>
            <input
              id="year"
              name="year"
              type="text"
              value={formData.year}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
              placeholder="2024"
            />
          </div>

          <div>
            <label htmlFor="sector" className="block text-sm font-medium mb-2">
              Secteur *
            </label>
            <input
              id="sector"
              name="sector"
              type="text"
              value={formData.sector}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
              placeholder="Services, Retail, Corporate..."
            />
          </div>
        </div>

        <MediaPicker
          value={formData.img}
          onChange={(url) => setFormData((prev) => ({ ...prev, img: url }))}
          label="Image du projet"
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Technologies utilisées *
          </label>
          <div className="space-y-2">
            {formData.technologies.map((tech, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tech}
                  onChange={(e) => handleArrayInput("technologies", index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all text-sm"
                  placeholder="Ex: Next.js, TypeScript..."
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("technologies", index)}
                  className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("technologies")}
              className="px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 text-sm transition-colors"
            >
              ➕ Ajouter une technologie
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Livrables *
          </label>
          <div className="space-y-2">
            {formData.deliverables.map((deliverable, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={deliverable}
                  onChange={(e) => handleArrayInput("deliverables", index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all text-sm"
                  placeholder="Ex: Site web responsive, Design UI/UX..."
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("deliverables", index)}
                  className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("deliverables")}
              className="px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 text-sm transition-colors"
            >
              ➕ Ajouter un livrable
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Résultats (optionnel)
          </label>
          <div className="space-y-2">
            {formData.results.map((result, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={result}
                  onChange={(e) => handleArrayInput("results", index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all text-sm"
                  placeholder="Ex: +150% de trafic, Taux de conversion 4.5%..."
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("results", index)}
                  className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("results")}
              className="px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 text-sm transition-colors"
            >
              ➕ Ajouter un résultat
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="published"
            name="published"
            type="checkbox"
            checked={formData.published}
            onChange={handleChange}
            className="w-4 h-4 rounded border-white/10 bg-transparent focus:ring-2 focus:ring-[var(--royal-blue)]"
          />
          <label htmlFor="published" className="text-sm font-medium">
            Publier immédiatement
          </label>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Création..." : "Créer le projet"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-outline"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

