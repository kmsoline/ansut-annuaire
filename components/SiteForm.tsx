"use client"

import { useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Site } from "@/lib/types"
import { useToast } from "@/components/Toast"

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false })

const PRESET_COLORS = [
  "#1d4ed8", "#7c3aed", "#059669", "#dc2626",
  "#d97706", "#0891b2", "#be185d", "#475569",
]

type Props = {
  site?: Site
  onClose: () => void
  onSaved: (site: Site) => void
}

export default function SiteForm({ site, onClose, onSaved }: Props) {
  const toast = useToast()
  const isEdit = !!site
  const [form, setForm] = useState({
    id: site?.id ?? "",
    name: site?.name ?? "",
    address: site?.address ?? "",
    lat: site?.lat?.toString() ?? "",
    lng: site?.lng?.toString() ?? "",
    color: site?.color ?? "#1d4ed8",
    image: site?.image ?? "",
  })
  const [imageMode, setImageMode] = useState<"url" | "upload">("url")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function set(k: string, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur upload")
      set("image", data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur upload")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const lat = parseFloat(form.lat)
    const lng = parseFloat(form.lng)
    if (isNaN(lat) || isNaN(lng)) {
      setError("Latitude et longitude doivent être des nombres valides.")
      return
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Coordonnées GPS hors limites.")
      return
    }

    setSaving(true)
    try {
      const url = isEdit ? `/api/sites/${site!.id}` : "/api/sites"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lat, lng }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur")
      toast.success(isEdit ? "Site mis à jour" : "Site créé")
      onSaved(data as Site)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue"
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {isEdit ? `Modifier — ${site!.name}` : "Nouveau site"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              Image du site
            </label>

            {/* Preview */}
            {form.image && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800">
                <img
                  src={form.image}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                  onError={() => set("image", "")}
                />
                <button
                  type="button"
                  onClick={() => set("image", "")}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full text-xs flex items-center justify-center"
                  title="Supprimer l'image"
                >
                  ×
                </button>
              </div>
            )}

            {/* Mode tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  imageMode === "url"
                    ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  imageMode === "upload"
                    ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                }`}
              >
                Upload
              </button>
            </div>

            {imageMode === "url" ? (
              <input
                type="url"
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            ) : (
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 text-sm text-gray-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Envoi en cours…" : form.image ? "Changer l'image" : "Choisir un fichier (JPG, PNG, WEBP)"}
                </button>
                {uploadError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{uploadError}</p>
                )}
              </div>
            )}
          </div>

          {!isEdit && (
            <Field label="Identifiant (ex: siege-2)">
              <input
                value={form.id}
                onChange={(e) => set("id", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                required
                placeholder="siege"
                className={inputCls}
              />
            </Field>
          )}

          <Field label="Nom du site">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="Siège ANSUT"
              className={inputCls}
            />
          </Field>

          <Field label="Adresse">
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Plateau, Abidjan"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <input
                value={form.lat}
                onChange={(e) => set("lat", e.target.value)}
                required
                placeholder="5.3479"
                type="number"
                step="any"
                className={inputCls}
              />
            </Field>
            <Field label="Longitude">
              <input
                value={form.lng}
                onChange={(e) => set("lng", e.target.value)}
                required
                placeholder="-4.0185"
                type="number"
                step="any"
                className={inputCls}
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline text-left -mt-1"
          >
            {showMap ? "Masquer la carte" : "Choisir sur la carte"}
          </button>

          {showMap && (
            <div className="-mt-1">
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-2">
                Cliquez sur la carte ou déplacez le marqueur pour définir l&apos;emplacement.
              </p>
              <LocationPicker
                lat={parseFloat(form.lat) || 5.36}
                lng={parseFloat(form.lng) || -4.008}
                onChange={(lat, lng) => {
                  set("lat", lat.toString())
                  set("lng", lng.toString())
                }}
              />
            </div>
          )}

          <Field label="Couleur">
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("color", c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    form.color === c ? "border-gray-900 dark:border-white scale-110" : "border-transparent"
                  }`}
                  style={{ background: c }}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border border-gray-200 dark:border-slate-600"
                title="Couleur personnalisée"
              />
            </div>
          </Field>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-medium transition-colors"
            >
              {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  )
}
