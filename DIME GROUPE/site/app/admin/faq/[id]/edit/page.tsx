"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditFAQ() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    question: "",
    answer: "",
    order: 0,
    active: true,
  });

  useEffect(() => {
    loadFAQ();
  }, [id]);

  const loadFAQ = async () => {
    try {
      const response = await fetch(`/api/admin/faq/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        setError("Erreur lors du chargement de la FAQ");
      }
    } catch (error) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/faq");
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      setError("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--royal-blue)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Modifier la FAQ</h1>
        <p className="text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          Modifiez les informations de la FAQ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass glass-strong rounded-xl p-6 space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Catégorie *
          </label>
          <input
            id="category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="question" className="block text-sm font-medium mb-2">
            Question *
          </label>
          <input
            id="question"
            name="question"
            type="text"
            value={formData.question}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="answer" className="block text-sm font-medium mb-2">
            Réponse *
          </label>
          <textarea
            id="answer"
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all resize-none"
          />
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-medium mb-2">
            Ordre d'affichage
          </label>
          <input
            id="order"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          />
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
            Actif
          </label>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
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


