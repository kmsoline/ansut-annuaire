"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "editor" as "admin" | "editor",
    active: true,
  });
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        setError("Erreur lors du chargement de l'utilisateur");
      }
    } catch (error) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (showPasswordSection && passwordData.password) {
      if (passwordData.password.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères");
        return;
      }
      if (passwordData.password !== passwordData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }
    }

    setIsSaving(true);

    try {
      const body: Record<string, unknown> = { ...formData };
      if (showPasswordSection && passwordData.password) {
        body.password = passwordData.password;
      }
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        router.push("/admin/users");
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
        <h1 className="text-3xl font-bold mb-2">Modifier l'utilisateur</h1>
        <p className="text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
          Modifiez les informations de l'utilisateur
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

        {/* Section changement de mot de passe */}
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowPasswordSection(!showPasswordSection);
              setPasswordData({ password: "", confirmPassword: "" });
            }}
            className="text-sm font-medium text-[var(--royal-blue)] hover:underline"
          >
            {showPasswordSection ? "Annuler le changement de mot de passe" : "Changer le mot de passe"}
          </button>

          {showPasswordSection && (
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Nouveau mot de passe *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  minLength={8}
                  placeholder="Minimum 8 caractères"
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirmer le nouveau mot de passe *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Répétez le nouveau mot de passe"
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}
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


