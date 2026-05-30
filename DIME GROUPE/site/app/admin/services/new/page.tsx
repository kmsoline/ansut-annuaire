"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MediaPicker from "@/app/components/MediaPicker";

interface ServiceItem {
  icon: string;
  name: string;
  description: string;
  details?: string[];
}

export default function NewService() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    description: "",
    longDescription: "",
    img: "",
    icon: "",
    items: [] as ServiceItem[],
    benefits: [] as string[],
    process: [] as string[],
    pricing: "",
    active: true,
  });

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setFormData((prev) => ({ ...prev, category: decodeURIComponent(categoryParam) }));
    }
  }, [searchParams]);

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

  // Gestion des items (sous-services)
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { icon: "", name: "", description: "", details: [] }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof ServiceItem, value: string | string[]) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItemDetail = (itemIndex: number) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        details: [...(newItems[itemIndex].details || []), ""],
      };
      return { ...prev, items: newItems };
    });
  };

  const removeItemDetail = (itemIndex: number, detailIndex: number) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        details: newItems[itemIndex].details?.filter((_, i) => i !== detailIndex) || [],
      };
      return { ...prev, items: newItems };
    });
  };

  const updateItemDetail = (itemIndex: number, detailIndex: number, value: string) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      const details = [...(newItems[itemIndex].details || [])];
      details[detailIndex] = value;
      newItems[itemIndex] = { ...newItems[itemIndex], details };
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/services");
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
        <h1 className="text-3xl font-bold mb-2">Nouveau service</h1>
        <p className="text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          Ajoutez un nouveau service
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
            <option value="Infrastructure & IT">Infrastructure & IT</option>
            <option value="Développement & Applications">Développement & Applications</option>
            <option value="Communication, Création & Événementiel">Communication, Création & Événementiel</option>
            <option value="Conseil & Stratégie">Conseil & Stratégie</option>
            <option value="Tourisme & Loisirs">Tourisme & Loisirs</option>
          </select>
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
            placeholder="Description courte du service"
          />
        </div>

        <div>
          <label htmlFor="longDescription" className="block text-sm font-medium mb-2">
            Description détaillée
          </label>
          <textarea
            id="longDescription"
            name="longDescription"
            value={formData.longDescription || ""}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all resize-none"
            placeholder="Description détaillée du service"
          />
        </div>

        <div>
          <label htmlFor="icon" className="block text-sm font-medium mb-2">
            Icône (emoji)
          </label>
          <input
            id="icon"
            name="icon"
            type="text"
            value={formData.icon || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
            placeholder="✅"
          />
        </div>

        <MediaPicker
          value={formData.img}
          onChange={(url) => setFormData((prev) => ({ ...prev, img: url }))}
          label="Image du service"
        />

        {/* Gestion des sous-services (items) */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium">
              Sous-services (items) *
            </label>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 text-sm transition-colors"
            >
              ➕ Ajouter un sous-service
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, itemIndex) => (
              <div key={itemIndex} className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold">Sous-service #{itemIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem(itemIndex)}
                    className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm transition-colors"
                  >
                    🗑️ Supprimer
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Icône (emoji) *</label>
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) => updateItem(itemIndex, "icon", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all text-sm"
                        placeholder="🌐"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Nom *</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(itemIndex, "name", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all text-sm"
                        placeholder="Nom du sous-service"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Description *</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(itemIndex, "description", e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all resize-none text-sm"
                      placeholder="Description du sous-service"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium">Détails (optionnel)</label>
                      <button
                        type="button"
                        onClick={() => addItemDetail(itemIndex)}
                        className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs transition-colors"
                      >
                        ➕ Ajouter un détail
                      </button>
                    </div>
                    <div className="space-y-2">
                      {item.details?.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={detail}
                            onChange={(e) => updateItemDetail(itemIndex, detailIndex, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all text-sm"
                            placeholder="Détail du sous-service"
                          />
                          <button
                            type="button"
                            onClick={() => removeItemDetail(itemIndex, detailIndex)}
                            className="px-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleChange}
            className="w-4 h-4 rounded border-white/10 bg-transparent focus:ring-2 focus:ring-[var(--royal-blue)]"
          />
          <label htmlFor="active" className="text-sm font-medium">
            Service actif
          </label>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Création..." : "Créer le service"}
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

