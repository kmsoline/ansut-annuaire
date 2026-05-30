"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUser() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "editor" as "admin" | "editor",
    password: "",
    confirmPassword: "",
    active: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...payload } = formData;
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/admin/users");
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
        <h1 className="text-3xl font-bold mb-2">Nouvel utilisateur</h1>
        <p className="text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          Ajoutez un nouvel utilisateur administrateur
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass glass-strong rounded-xl p-6 space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Nom complet *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Mot de passe *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="Minimum 8 caractères"
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirmer le mot de passe *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Répétez le mot de passe"
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-2">
            Rôle *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
          >
            <option value="editor">Éditeur</option>
            <option value="admin">Administrateur</option>
          </select>
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
            {isLoading ? "Création..." : "Créer l'utilisateur"}
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


