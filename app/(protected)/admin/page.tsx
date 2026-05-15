"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Employee } from "@/lib/types"
import EmployeeForm from "@/components/EmployeeForm"
import UserForm from "@/components/UserForm"
import { useToast } from "@/components/Toast"
import * as XLSX from "xlsx"

type UserRecord = {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

type LogEntry = {
  id: string
  timestamp: string
  adminEmail: string
  action: string
  target: string
  details?: string
}

function Initials({ name }: { name: string }) {
  const parts = (name ?? "?").trim().split(" ")
  return <>{parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase()}</>
}

function Avatar({ photo, name, size = "sm" }: { photo?: string | null; name: string; size?: "sm" | "xs" }) {
  const sz = size === "xs" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"
  return (
    <>
      {photo && (
        <img
          src={photo}
          alt=""
          className={`${sz} rounded-full object-cover flex-shrink-0`}
          onError={(e) => { const img = e.target as HTMLImageElement; img.style.display = "none"; img.nextElementSibling?.classList.remove("hidden") }}
        />
      )}
      <div className={`${sz} rounded-full bg-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0 ${photo ? "hidden" : ""}`}>
        <Initials name={name} />
      </div>
    </>
  )
}

// ─── Import CSV/XLSX Modal ─────────────────────────────────────────────────

type ImportRow = Record<string, string>

function parseCSV(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
    const row: ImportRow = {}
    headers.forEach((h, i) => { row[h] = cols[i] ?? "" })
    return row
  })
}

function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: (count: number) => void }) {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [fileName, setFileName] = useState("")
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ ok: number; err: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    setRows([])

    if (file.name.endsWith(".csv")) {
      const text = await file.text()
      setRows(parseCSV(text))
    } else {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<ImportRow>(ws, { defval: "" })
      setRows(data as ImportRow[])
    }
  }

  async function doImport() {
    setImporting(true)
    setProgress(0)
    let ok = 0
    let err = 0
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const payload = {
        nom: row.nom ?? row.Nom ?? "",
        fonction: row.fonction ?? row.Fonction ?? "",
        direction: row.direction ?? row.Direction ?? "",
        email: row.email ?? row.Email ?? "",
        contact: row.contact ?? row.Contact ?? "",
        extension: row.extension ?? row.Extension ?? "",
        site: row.site ?? row.Site ?? "",
        manager: row.manager ?? row.Manager ?? "",
      }
      try {
        const res = await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        if (res.ok) ok++; else err++
      } catch { err++ }
      setProgress(i + 1)
    }
    setImporting(false)
    setResult({ ok, err })
    onImported(ok)
  }

  const preview = rows.slice(0, 5)
  const headers = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Importer des collaborateurs</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          Colonnes attendues : <span className="font-mono font-medium">nom, fonction, direction, email, contact, extension, site, manager</span>
        </p>

        <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${rows.length ? "border-green-400 bg-green-50 dark:bg-green-900/10" : "border-gray-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10"}`}>
          <span className="text-3xl">{rows.length ? "✅" : "📂"}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{fileName || "Choisir un fichier .csv ou .xlsx"}</span>
          {rows.length > 0 && <span className="text-xs text-green-600 dark:text-green-400">{rows.length} lignes détectées</span>}
          <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFile} />
        </label>

        {preview.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Aperçu (5 premières lignes)</p>
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-700">
              <table className="text-xs w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/50">
                    {headers.map((h) => <th key={h} className="px-3 py-2 text-left text-gray-500 dark:text-slate-400 font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-gray-50 dark:border-slate-700/50">
                      {headers.map((h) => <td key={h} className="px-3 py-2 text-gray-700 dark:text-slate-300 truncate max-w-[120px]">{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {importing && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
              <span>Import en cours…</span>
              <span>{progress} / {rows.length}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${rows.length ? (progress / rows.length) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {result && (
          <div className={`mt-4 rounded-xl p-3 text-sm font-medium ${result.err === 0 ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"}`}>
            {result.ok} agent{result.ok > 1 ? "s" : ""} importé{result.ok > 1 ? "s" : ""}
            {result.err > 0 && ` · ${result.err} erreur${result.err > 1 ? "s" : ""}`}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
            Fermer
          </button>
          <button
            onClick={doImport}
            disabled={rows.length === 0 || importing || result !== null}
            className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-sm font-medium transition-colors"
          >
            {importing ? `Importation… (${progress}/${rows.length})` : `Importer ${rows.length} agent${rows.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Collaborateurs tab ────────────────────────────────────────────────────

function CollaborateursTab() {
  const toast = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [formTarget, setFormTarget] = useState<Employee | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    fetch("/api/employees").then((r) => r.json()).then((d) => { setEmployees(d); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return employees.filter((e) => !q || e.nom?.toLowerCase().includes(q) || e.fonction?.toLowerCase().includes(q) || e.direction?.toLowerCase().includes(q))
  }, [employees, search])

  function handleSaved(saved: Employee) {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id)
      return idx !== -1 ? prev.map((e, i) => (i === idx ? saved : e)) : [...prev, saved]
    })
    setFormTarget(undefined)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/employees/${deleteTarget.id}`, { method: "DELETE" })
    toast.success(`${deleteTarget.nom} supprimé`)
    setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    setDeleteTarget(null)
    setDeleting(false)
  }

  function handleImported(count: number) {
    if (count > 0) {
      fetch("/api/employees").then((r) => r.json()).then(setEmployees)
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-slate-400">{employees.length} collaborateurs</p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
          >
            📥 Importer
          </button>
          <button
            onClick={() => setFormTarget(null)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-medium transition-colors shadow"
          >
            + Ajouter un collaborateur
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className={inputCls + " pl-9"}
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                <Th>Collaborateur</Th>
                <Th className="hidden md:table-cell">Direction</Th>
                <Th className="hidden lg:table-cell">Contact</Th>
                <Th className="hidden lg:table-cell">Site</Th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-slate-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-600 animate-pulse" />
                          <div className="space-y-1.5"><div className="h-3 w-32 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" /><div className="h-2.5 w-24 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" /></div>
                        </div>
                      </td>
                      {[1, 2, 3].map((j) => <td key={j} className="px-4 py-3 hidden md:table-cell"><div className="h-3 w-24 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" /></td>)}
                      <td />
                    </tr>
                  ))
                : filtered.map((emp) => (
                    <tr key={emp.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar photo={emp.photo} name={emp.nom ?? "?"} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{emp.nom}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{emp.fonction}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-slate-300 hidden md:table-cell">{emp.direction?.replace(/\s*\(.*?\)\s*/g, "").trim()}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="text-xs text-gray-500 dark:text-slate-400 space-y-0.5">
                          {emp.contact && <p>📞 {emp.contact}</p>}
                          {emp.email && <p className="truncate max-w-[160px]">✉ {emp.email}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 hidden lg:table-cell">{emp.site}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <ActionBtn title="Modifier" onClick={() => setFormTarget(emp)}>✏️</ActionBtn>
                          <ActionBtn title="Supprimer" onClick={() => setDeleteTarget(emp)} danger>🗑️</ActionBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <EmptyState />}
        </div>
      </div>

      {formTarget !== undefined && (
        <EmployeeForm employee={formTarget} onClose={() => setFormTarget(undefined)} onSaved={handleSaved} />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Supprimer ce collaborateur ?"
          description={`${deleteTarget.nom} sera définitivement supprimé de l'annuaire.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showImport && <ImportModal onClose={() => setShowImport(false)} onImported={handleImported} />}
    </>
  )
}

// ─── Utilisateurs tab ──────────────────────────────────────────────────────

function UtilisateursTab() {
  const toast = useToast()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [formTarget, setFormTarget] = useState<UserRecord | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then((d) => { setUsers(d); setLoading(false) })
  }, [])

  function handleSaved(saved: UserRecord) {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === saved.id)
      return idx !== -1 ? prev.map((u, i) => (i === idx ? saved : u)) : [...prev, saved]
    })
    setFormTarget(undefined)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError("")
    const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" })
    if (!res.ok) {
      const { error } = await res.json()
      setDeleteError(error)
      setDeleting(false)
      return
    }
    toast.success(`Compte ${deleteTarget.name} supprimé`)
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
    setDeleteTarget(null)
    setDeleting(false)
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-slate-400">{users.length} compte{users.length > 1 ? "s" : ""}</p>
        <button
          onClick={() => setFormTarget(null)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-medium transition-colors shadow"
        >
          + Ajouter un compte
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
              <Th>Utilisateur</Th>
              <Th>Rôle</Th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-slate-700/50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-600 animate-pulse" /><div className="space-y-1.5"><div className="h-3 w-32 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" /><div className="h-2.5 w-40 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" /></div></div></td>
                    <td className="px-4 py-3"><div className="h-5 w-16 bg-gray-200 dark:bg-slate-600 rounded-full animate-pulse" /></td>
                    <td />
                  </tr>
                ))
              : users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          <Initials name={user.name} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"}`}>
                        {user.role === "admin" ? "🛡 Admin" : "👤 Utilisateur"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <ActionBtn title="Modifier / Réinitialiser le mot de passe" onClick={() => setFormTarget(user)}>✏️</ActionBtn>
                        <ActionBtn title="Supprimer" onClick={() => setDeleteTarget(user)} danger>🗑️</ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && <EmptyState />}
      </div>

      {formTarget !== undefined && (
        <UserForm user={formTarget} onClose={() => setFormTarget(undefined)} onSaved={handleSaved} />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Supprimer ce compte ?"
          description={`Le compte de ${deleteTarget.name} (${deleteTarget.email}) sera supprimé.`}
          loading={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => { setDeleteTarget(null); setDeleteError("") }}
        />
      )}
    </>
  )
}

// ─── Statistiques tab ──────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl flex-shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

function StatistiquesTab() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/employees").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([emps, users]) => {
      setEmployees(emps)
      setUserCount(users.length)
      setLoading(false)
    })
  }, [])

  const byDirection = useMemo(() => {
    const map: Record<string, number> = {}
    employees.forEach((e) => {
      const dir = e.direction?.replace(/\s*\(.*?\)\s*/g, "").trim() || "Non renseigné"
      map[dir] = (map[dir] ?? 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [employees])

  const bySite = useMemo(() => {
    const map: Record<string, number> = {}
    employees.forEach((e) => {
      const site = e.site || "Non renseigné"
      map[site] = (map[site] ?? 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [employees])

  const sansPhoto = useMemo(() => employees.filter((e) => !e.photo), [employees])
  const sansMobile = useMemo(() => employees.filter((e) => !e.contact), [employees])
  const sansEmail = useMemo(() => employees.filter((e) => !e.email), [employees])

  const maxDir = byDirection[0]?.[1] ?? 1

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total agents" value={employees.length} icon="👥" />
        <StatCard label="Total utilisateurs" value={userCount} icon="🛡" />
        <StatCard label="Sans photo" value={sansPhoto.length} icon="🖼" />
        <StatCard label="Sans mobile" value={sansMobile.length} icon="📵" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">Par direction</h3>
          <div className="space-y-3">
            {byDirection.map(([dir, count]) => (
              <div key={dir}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-slate-300 truncate mr-2">{dir}</span>
                  <span className="font-semibold text-gray-900 dark:text-white flex-shrink-0">{count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-1.5 bg-blue-600 rounded-full" style={{ width: `${(count / maxDir) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">Par site</h3>
            <div className="space-y-2">
              {bySite.map(([site, count]) => (
                <div key={site} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-slate-300">{site}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">Données incomplètes</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Sans email</span>
                <span className="font-semibold text-gray-900 dark:text-white">{sansEmail.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Sans mobile</span>
                <span className="font-semibold text-gray-900 dark:text-white">{sansMobile.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Sans photo</span>
                <span className="font-semibold text-gray-900 dark:text-white">{sansPhoto.length}</span>
              </div>
            </div>
            {sansPhoto.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">Voir la liste ({sansPhoto.length})</summary>
                <ul className="mt-2 text-xs text-gray-500 dark:text-slate-400 space-y-0.5 max-h-40 overflow-y-auto">
                  {sansPhoto.map((e) => <li key={e.id}>• {e.nom}</li>)}
                </ul>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Logs tab ──────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  create_employee: { label: "Ajout agent", icon: "➕", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  update_employee: { label: "Modif. agent", icon: "✏️", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  delete_employee: { label: "Suppr. agent", icon: "🗑️", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  create_user: { label: "Ajout compte", icon: "👤", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  update_user: { label: "Modif. compte", icon: "🛡", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  delete_user: { label: "Suppr. compte", icon: "🚫", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

function LogsTab() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/logs").then((r) => r.json()).then((d) => { setLogs(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-600 flex-shrink-0" />
            <div className="flex-1 space-y-2"><div className="h-3 w-48 bg-gray-200 dark:bg-slate-600 rounded" /><div className="h-2.5 w-32 bg-gray-100 dark:bg-slate-700 rounded" /></div>
          </div>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return <div className="text-center py-16 text-gray-400 dark:text-slate-500 text-sm">Aucune activité enregistrée</div>
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const meta = ACTION_LABELS[log.action] ?? { label: log.action, icon: "📋", color: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300" }
        const date = new Date(log.timestamp)
        return (
          <div key={log.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${meta.color}`}>
              {meta.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm truncate">{log.target}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 dark:text-slate-500">
                <span>👤 {log.adminEmail}</span>
                <span>{date.toLocaleDateString("fr-FR")} à {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                {log.details && <span>{log.details}</span>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────

type Tab = "collaborateurs" | "utilisateurs" | "statistiques" | "logs"

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("collaborateurs")

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Administration</h1>
        <div className="flex gap-1 mt-3 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          <TabButton active={tab === "collaborateurs"} onClick={() => setTab("collaborateurs")}>
            👥 Collaborateurs
          </TabButton>
          <TabButton active={tab === "utilisateurs"} onClick={() => setTab("utilisateurs")}>
            🛡 Comptes utilisateurs
          </TabButton>
          <TabButton active={tab === "statistiques"} onClick={() => setTab("statistiques")}>
            📊 Statistiques
          </TabButton>
          <TabButton active={tab === "logs"} onClick={() => setTab("logs")}>
            📋 Logs
          </TabButton>
        </div>
      </div>

      {tab === "collaborateurs" && <CollaborateursTab />}
      {tab === "utilisateurs" && <UtilisateursTab />}
      {tab === "statistiques" && <StatistiquesTab />}
      {tab === "logs" && <LogsTab />}
    </>
  )
}

// ─── Shared UI atoms ───────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${active ? "border-blue-700 text-blue-700 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"}`}
    >
      {children}
    </button>
  )
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide ${className}`}>{children}</th>
}

function ActionBtn({ title, onClick, danger, children }: { title: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg text-gray-400 transition-colors ${danger ? "hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30" : "hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"}`}
    >
      {children}
    </button>
  )
}

function EmptyState() {
  return <div className="text-center py-12 text-gray-400 dark:text-slate-500 text-sm">Aucun résultat</div>
}

function ConfirmModal({ title, description, loading, error, onConfirm, onCancel }: {
  title: string; description: string; loading: boolean; error?: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="text-4xl mb-3">🗑️</div>
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{title}</h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">{description}</p>
        {error && <p className="text-red-600 text-sm mb-3 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium transition-colors">
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-slate-500"
