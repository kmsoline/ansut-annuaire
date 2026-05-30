"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewFAQ() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    question: "",
    answer: "",
    order: 0,
    active: true,
  });

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
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/faq");
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
        <h1 className="text-3xl font-bold mb-2">Nouvelle FAQ</h1>
        <p className="text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          Ajoutez une nouvelle question fréquente
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
            placeholder="Services Généraux"
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
            placeholder="Quels sont les domaines d'expertise de DIME GROUPE ?"
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
            placeholder="DIME GROUPE propose 5 pôles d'expertise..."
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
            placeholder="0"
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
            disabled={isLoading}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Création..." : "Créer la FAQ"}
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


