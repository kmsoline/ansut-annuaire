"use client"

import { useState, useRef } from "react"
import { Employee } from "@/lib/types"
import { useToast } from "@/components/Toast"

const DIRECTIONS = [
  "Présidence Du Conseil D'administration (PCA)",
  "Direction Générale (DG)",
  "Direction Générale Adjointe (DGA)",
  "Direction Générale (DG) / Etat Major",
  "Direction Juridique et Moyens Généraux (DJMG)",
  "Direction Des Affaires Financières (DAF)",
  "Département Des Ressources Humaines Et Compétences (DRHCOM)",
  "Direction Développement des Infrastructures et RNHD (DDIR)",
  "Direction Solutions et Intégrations des Services (DSIS)",
  "Direction de la Transformation Digitale et Innovation (DTDI)",
]

const SITES = ["Siège ANSUT", "Postel ANSUT", "Autre"]

type Props = {
  employee?: Employee | null
  onClose: () => void
  onSaved: (employee: Employee) => void
}

type FormData = {
  nom: string
  fonction: string
  extension: string
  contact: string
  email: string
  photo: string
  direction: string
  site: string
  manager: string
}

export default function EmployeeForm({ employee, onClose, onSaved }: Props) {
  const toast = useToast()
  const [form, setForm] = useState<FormData>({
    nom: employee?.nom ?? "",
    fonction: employee?.fonction ?? "",
    extension: employee?.extension ?? "",
    contact: employee?.contact ?? "",
    email: employee?.email ?? "",
    photo: employee?.photo ?? "",
    direction: employee?.direction ?? "",
    site: employee?.site ?? "",
    manager: employee?.manager ?? "",
  })
  const [photoMode, setPhotoMode] = useState<"url" | "upload">("url")
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const [uploadPreview, setUploadPreview] = useState<string | null>(employee?.photo ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Local preview immediately
    setUploadPreview(URL.createObjectURL(file))
    setUploadState("uploading")

    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) {
        const { error } = await res.json()
        setUploadState("error")
        setError(error ?? "Erreur lors de l'upload")
        return
      }
      const { url } = await res.json()
      set("photo", url)
      setUploadState("done")
    } catch {
      setUploadState("error")
      setError("Erreur réseau lors de l'upload")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom.trim()) { setError("Le nom est obligatoire"); return }
    if (photoMode === "upload" && uploadState === "uploading") {
      setError("Attendez la fin de l'upload de la photo")
      return
    }
    setError("")
    setLoading(true)

    const payload = {
      nom: form.nom.trim() || null,
      fonction: form.fonction.trim() || null,
      extension: form.extension.trim() || null,
      contact: form.contact.trim() || null,
      email: form.email.trim() || null,
      photo: form.photo.trim() || null,
      direction: form.direction || null,
      site: form.site.trim() || null,
      manager: form.manager.trim() || null,
    }

    try {
      const res = employee
        ? await fetch(`/api/employees/${employee.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

      if (!res.ok) throw new Error(await res.text())
      const saved = await res.json()
      toast.success(employee ? "Collaborateur mis à jour" : "Collaborateur ajouté")
      onSaved(saved)
    } catch {
      setError("Erreur lors de la sauvegarde.")
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between z-10">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">
            {employee ? "Modifier le collaborateur" : "Ajouter un collaborateur"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom complet" required>
              <input
                value={form.nom}
                onChange={(e) => set("nom", e.target.value)}
                className={inputCls}
                placeholder="Prénom NOM"
                required
              />
            </Field>
            <Field label="Fonction">
              <input
                value={form.fonction}
                onChange={(e) => set("fonction", e.target.value)}
                className={inputCls}
                placeholder="Directeur, Chargé de..."
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={inputCls}
                placeholder="prenom.nom@ansut.ci"
              />
            </Field>
            <Field label="Téléphone mobile">
              <input
                value={form.contact}
                onChange={(e) => set("contact", e.target.value)}
                className={inputCls}
                placeholder="07 XX XX XX XX"
              />
            </Field>
            <Field label="Extension téléphonique">
              <input
                value={form.extension}
                onChange={(e) => set("extension", e.target.value)}
                className={inputCls}
                placeholder="95 10"
              />
            </Field>
            <Field label="Site géographique">
              <select
                value={form.site}
                onChange={(e) => set("site", e.target.value)}
                className={inputCls}
              >
                <option value="">— Sélectionner —</option>
                {SITES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Direction">
            <select
              value={form.direction}
              onChange={(e) => set("direction", e.target.value)}
              className={inputCls}
            >
              <option value="">— Sélectionner une direction —</option>
              {DIRECTIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>

          <Field label="Manager (nom complet)">
            <input
              value={form.manager}
              onChange={(e) => set("manager", e.target.value)}
              className={inputCls}
              placeholder="Prénom NOM du manager"
            />
          </Field>

          {/* Photo section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600 dark:text-slate-400">Photo</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 text-xs">
                <button
                  type="button"
                  onClick={() => setPhotoMode("url")}
                  className={`px-3 py-1 transition-colors ${photoMode === "url" ? "bg-blue-700 text-white" : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50"}`}
                >
                  🔗 URL
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode("upload")}
                  className={`px-3 py-1 transition-colors ${photoMode === "upload" ? "bg-blue-700 text-white" : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50"}`}
                >
                  📁 Fichier
                </button>
              </div>
            </div>

            {photoMode === "url" ? (
              <input
                value={form.photo}
                onChange={(e) => { set("photo", e.target.value); setUploadPreview(e.target.value || null) }}
                className={inputCls}
                placeholder="https://..."
              />
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  uploadState === "uploading"
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : uploadState === "done"
                    ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                    : uploadState === "error"
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {uploadState === "uploading" && <p className="text-blue-600 text-sm font-medium">Upload en cours...</p>}
                {uploadState === "done" && <p className="text-green-600 text-sm font-medium">✓ Photo uploadée</p>}
                {uploadState === "error" && <p className="text-red-600 text-sm font-medium">Erreur — cliquez pour réessayer</p>}
                {uploadState === "idle" && (
                  <>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Cliquez pour sélectionner une photo</p>
                    <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">JPG, PNG, WEBP, GIF — max 5 Mo</p>
                  </>
                )}
              </div>
            )}

            {/* Preview */}
            {(uploadPreview || form.photo) && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={uploadPreview ?? form.photo}
                  alt="aperçu"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Aperçu de la photo</p>
                  <button
                    type="button"
                    onClick={() => { set("photo", ""); setUploadPreview(null); setUploadState("idle") }}
                    className="text-xs text-red-500 hover:text-red-700 mt-0.5"
                  >
                    Supprimer la photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || uploadState === "uploading"}
              className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-sm font-medium transition-colors"
            >
              {loading ? "Sauvegarde..." : employee ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-slate-500"
