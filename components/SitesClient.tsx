"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { Employee, Site } from "@/lib/types"
import EmployeeModal from "@/components/EmployeeModal"
import SiteForm from "@/components/SiteForm"

// Dynamic import to avoid SSR for Leaflet
const SiteMapDynamic = dynamic(() => import("@/components/SiteMapInteractive"), { ssr: false })

function getInitials(name: string) {
  const parts = name.trim().split(" ")
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}

export default function SitesPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  const [employees, setEmployees] = useState<Employee[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [editingSite, setEditingSite] = useState<Site | null | "new">(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSites = useCallback(async () => {
    const [sitesRes, empsRes] = await Promise.all([
      fetch("/api/sites"),
      fetch("/api/employees"),
    ])
    const [sitesData, empsData] = await Promise.all([sitesRes.json(), empsRes.json()])
    setSites(sitesData)
    if (Array.isArray(empsData)) setEmployees(empsData as Employee[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  function handleSiteSaved(saved: Site) {
    setSites((prev) => {
      const exists = prev.find((s) => s.id === saved.id)
      return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [...prev, saved]
    })
    setEditingSite(null)
  }

  async function handleDeleteSite(id: string) {
    setDeletingId(id)
    try {
      await fetch(`/api/sites/${id}`, { method: "DELETE" })
      setSites((prev) => prev.filter((s) => s.id !== id))
      if (activeSiteId === id) setActiveSiteId(null)
    } finally {
      setDeletingId(null)
    }
  }

  const activeSite = sites.find((s) => s.id === activeSiteId) ?? null
  const activeSiteEmployees = activeSiteId
    ? employees.filter((e) => e.site === activeSite?.name)
    : []

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sites ANSUT</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {sites.length} site{sites.length > 1 ? "s" : ""} · {employees.length} collaborateurs
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setEditingSite("new")}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Nouveau site
          </button>
        )}
      </div>

      {/* Site cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {sites.map((site) => {
            const count = employees.filter((e) => e.site === site.name).length
            const isActive = activeSiteId === site.id
            return (
              <div
                key={site.id}
                className={`relative rounded-2xl border overflow-hidden cursor-pointer transition-all group ${
                  isActive
                    ? "border-[--site-color] shadow-md"
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm"
                }`}
                style={{ "--site-color": site.color } as React.CSSProperties}
                onClick={() => setActiveSiteId(isActive ? null : site.id)}
              >
                {/* Site image or color banner */}
                {site.image ? (
                  <div className="w-full h-28 overflow-hidden">
                    <img
                      src={site.image}
                      alt={site.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-12 opacity-20"
                    style={{ background: site.color }}
                  />
                )}

                <div className="p-4">
                  {/* Color dot + name */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: site.color }} />
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{site.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{site.address}</p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                    {count} agent{count > 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                    >
                      🗺 Itinéraire
                    </a>
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingSite(site) }}
                          className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                          title="Modifier le site"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Supprimer "${site.name}" ?`)) handleDeleteSite(site.id)
                          }}
                          disabled={deletingId === site.id}
                          className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                          title="Supprimer le site"
                        >
                          {deletingId === site.id ? "⏳" : "🗑"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                    style={{ background: site.color }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Map + employees panel */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: 440 }}>
        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-700 min-h-[380px] lg:min-h-0">
          {!loading && (
            <SiteMapDynamic
              key={sites.map((s) => `${s.id}:${s.lat},${s.lng}`).join("|")}
              sites={sites}
              activeSiteId={activeSiteId}
              onSelectSite={setActiveSiteId}
            />
          )}
        </div>

        {/* Employee list panel */}
        <div
          className={`w-full lg:w-72 flex-shrink-0 transition-all ${
            activeSiteId ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {activeSite && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm h-full flex flex-col">
              <div
                className="px-4 py-3 rounded-t-2xl flex items-center justify-between flex-shrink-0"
                style={{ background: activeSite.color + "18" }}
              >
                <div>
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: activeSite.color }}
                  >
                    {activeSite.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {activeSiteEmployees.length} agent{activeSiteEmployees.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setActiveSiteId(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-2">
                {activeSiteEmployees.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-8">
                    Aucun collaborateur assigné
                  </p>
                ) : (
                  activeSiteEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
                    >
                      {emp.photo ? (
                        <img
                          src={emp.photo}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(emp.nom ?? "?")}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">
                          {emp.nom}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                          {emp.fonction}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EmployeeModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onSelectEmployee={(emp) => setSelectedEmployee(emp)}
      />

      {editingSite && (
        <SiteForm
          site={editingSite === "new" ? undefined : editingSite}
          onClose={() => setEditingSite(null)}
          onSaved={handleSiteSaved}
        />
      )}
    </>
  )
}
