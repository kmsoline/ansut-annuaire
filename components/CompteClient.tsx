"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { useToast } from "@/components/Toast"

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrateur",
  user: "Utilisateur",
}

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  user: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
}

export default function ComptePage() {
  const { data: session } = useSession()
  const toast = useToast()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const user = session?.user
  const role = (user as { role?: string })?.role ?? "user"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Une erreur est survenue")
      } else {
        toast.success("Mot de passe mis à jour avec succès")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      toast.error("Erreur réseau, veuillez réessayer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mon compte</h1>

      {/* User info card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {user?.image ? (
            <img
              src={user.image}
              alt=""
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-600"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-700 flex items-center justify-center text-xl font-bold text-white border-2 border-blue-500 flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}

          {/* Info */}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-lg leading-tight truncate">
              {user?.name ?? "—"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email ?? "—"}</p>
            <span
              className={`inline-block mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                ROLE_STYLE[role] ?? ROLE_STYLE.user
              }`}
            >
              {ROLE_LABEL[role] ?? role}
            </span>
          </div>
        </div>
      </div>

      {/* Password change card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
          Changer le mot de passe
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Current password */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Mot de passe actuel
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {/* New password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirmer le nouveau mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {loading ? "Enregistrement…" : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  )
}
