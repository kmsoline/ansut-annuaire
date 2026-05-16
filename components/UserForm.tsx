"use client"

import { useState } from "react"

type UserRecord = {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

type Props = {
  user?: UserRecord | null
  onClose: () => void
  onSaved: (user: UserRecord) => void
}

export default function UserForm({ user, onClose, onSaved }: Props) {
  const isEdit = !!user
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [role, setRole] = useState<"admin" | "user">(user?.role ?? "user")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim() || (!isEdit && !email.trim())) {
      setError("Nom et email sont obligatoires")
      return
    }

    if (password || !isEdit) {
      if (!isEdit && !password) { setError("Le mot de passe est obligatoire"); return }
      if (password && password.length < 8) { setError("Le mot de passe doit faire au moins 8 caractères"); return }
      if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return }
    }

    setLoading(true)
    try {
      let res: Response
      if (isEdit) {
        const body: Record<string, string> = { name: name.trim(), role }
        if (password) body.password = password
        res = await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), name: name.trim(), password, role }),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Erreur lors de la sauvegarde")
        return
      }

      onSaved(await res.json())
    } catch {
      setError("Erreur réseau")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
              {isEdit ? "Modifier le compte" : "Ajouter un compte"}
            </h2>
            {isEdit && (
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                Laissez le mot de passe vide pour ne pas le modifier
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>Nom complet *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Prénom NOM"
              required
            />
          </div>

          {/* Email — read-only in edit mode */}
          <div>
            <label className={labelCls}>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls + (isEdit ? " opacity-60 cursor-not-allowed" : "")}
              placeholder="prenom.nom@ansut.ci"
              disabled={isEdit}
              required={!isEdit}
            />
            {isEdit && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">L&apos;email ne peut pas être modifié</p>}
          </div>

          {/* Role */}
          <div>
            <label className={labelCls}>Rôle *</label>
            <div className="grid grid-cols-2 gap-2">
              <RoleCard
                selected={role === "user"}
                onClick={() => setRole("user")}
                icon="👤"
                title="Utilisateur"
                desc="Accès lecture seule à l'annuaire"
              />
              <RoleCard
                selected={role === "admin"}
                onClick={() => setRole("admin")}
                icon="🛡"
                title="Administrateur"
                desc="Gestion complète de l'annuaire"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={labelCls}>
              {isEdit ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls + " pr-10"}
                placeholder={isEdit ? "Laisser vide pour ne pas changer" : "Min. 8 caractères"}
                required={!isEdit}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {showPassword ? "Masquer" : "Voir"}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          {(password || !isEdit) && (
            <div>
              <label className={labelCls}>Confirmer le mot de passe</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputCls}
                placeholder="Répéter le mot de passe"
              />
              {confirm && password !== confirm && (
                <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-sm font-medium transition-colors"
            >
              {loading ? "Sauvegarde..." : isEdit ? "Enregistrer" : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RoleCard({ selected, onClick, icon, title, desc }: {
  selected: boolean; onClick: () => void; icon: string; title: string; desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-3 rounded-xl border-2 transition-all ${
        selected
          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-slate-600 hover:border-blue-300"
      }`}
    >
      <div className="text-lg mb-1">{icon}</div>
      <p className={`text-sm font-semibold ${selected ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
        {title}
      </p>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{desc}</p>
    </button>
  )
}

const labelCls = "block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1"
const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-slate-500"
