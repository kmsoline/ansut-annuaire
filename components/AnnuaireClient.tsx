"use client"

import { useState, useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Employee, Site } from "@/lib/types"
import EmployeeCard from "@/components/EmployeeCard"
import EmployeeModal from "@/components/EmployeeModal"
import EmployeeForm from "@/components/EmployeeForm"
import { SkeletonGrid } from "@/components/EmployeeSkeleton"
import SearchBox from "@/components/SearchBox"

type SortOption = "default" | "az" | "za"

const SORT_LABELS: Record<SortOption, string> = {
  default: "Tri par défaut",
  az: "A → Z",
  za: "Z → A",
}

const PAGE_SIZE = 24

export default function AnnuairePage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  const [employees, setEmployees] = useState<Employee[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [search, setSearch] = useState("")
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null)
  const [selectedSite, setSelectedSite] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>("default")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<Employee | null>(null)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [mounted, setMounted] = useState(false)
  const [exportingXlsx, setExportingXlsx] = useState(false)
  const [filterNoPhoto, setFilterNoPhoto] = useState(false)
  const [filterNoMobile, setFilterNoMobile] = useState(false)
  const [filterNoEmail, setFilterNoEmail] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const directions = useMemo(
    () => Array.from(new Set(employees.map((e) => e.direction).filter(Boolean))) as string[],
    [employees]
  )

  useEffect(() => {
    Promise.all([
      fetch("/api/employees").then((r) => r.json()),
      fetch("/api/favorites").then((r) => r.json()).catch(() => ({ favorites: [] })),
      fetch("/api/sites").then((r) => r.json()).catch(() => []),
    ]).then(([emps, favData, sitesData]) => {
      if (Array.isArray(emps)) setEmployees(emps as Employee[])
      if (Array.isArray(favData.favorites)) setFavorites(new Set(favData.favorites as number[]))
      if (Array.isArray(sitesData)) setSites(sitesData as Site[])
      setMounted(true)
    })
  }, [])

  // Reset visible count when filters/search/sort change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, selectedDirection, selectedSite, sort, filterNoPhoto, filterNoMobile, filterNoEmail, showFavoritesOnly])

  function toggleFavorite(id: number) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      const arr = [...next]
      fetch("/api/favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorites: arr }),
      }).catch(() => {})
      return next
    })
  }

  function handleEditFromModal(emp: Employee) {
    setSelected(null)
    setEditing(emp)
  }

  function handleSaved(saved: Employee) {
    setEmployees((prev) => prev.map((e) => (e.id === saved.id ? saved : e)))
    setSelected(saved)
    setEditing(null)
  }

  const activeSite = selectedSite ? sites.find((s) => s.id === selectedSite) : null

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let result = employees.filter((e) => {
      const matchSearch =
        !q ||
        e.nom?.toLowerCase().includes(q) ||
        e.fonction?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.contact?.toLowerCase().includes(q)
      const matchDir = !selectedDirection || e.direction === selectedDirection
      const matchSite = !selectedSite || e.site === activeSite?.name
      const matchFav = !showFavoritesOnly || favorites.has(e.id)
      const matchNoPhoto = !filterNoPhoto || !e.photo
      const matchNoMobile = !filterNoMobile || !e.contact
      const matchNoEmail = !filterNoEmail || !e.email
      return matchSearch && matchDir && matchSite && matchFav && matchNoPhoto && matchNoMobile && matchNoEmail
    })

    if (sort === "az") result = [...result].sort((a, b) => (a.nom ?? "").localeCompare(b.nom ?? "", "fr"))
    if (sort === "za") result = [...result].sort((a, b) => (b.nom ?? "").localeCompare(a.nom ?? "", "fr"))

    return result
  }, [search, selectedDirection, selectedSite, activeSite, showFavoritesOnly, favorites, sort, employees, filterNoPhoto, filterNoMobile, filterNoEmail])

  const visibleEmployees = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])

  const grouped = useMemo(() => {
    if (sort !== "default" || selectedDirection) {
      return { "": visibleEmployees }
    }
    return visibleEmployees.reduce<Record<string, Employee[]>>((acc, emp) => {
      const dir = emp.direction ?? "Autre"
      if (!acc[dir]) acc[dir] = []
      acc[dir].push(emp)
      return acc
    }, {})
  }, [visibleEmployees, selectedDirection, sort])

  async function exportExcel() {
    setExportingXlsx(true)
    try {
      const XLSX = await import("xlsx")
      const rows = filtered.map((e) => ({
        Nom: e.nom ?? "",
        Fonction: e.fonction ?? "",
        Direction: e.direction ?? "",
        Email: e.email ?? "",
        Téléphone: e.contact ?? "",
        Extension: e.extension ?? "",
        Site: e.site ?? "",
        Manager: e.manager ?? "",
      }))
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Annuaire ANSUT")
      // Auto column widths
      const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
        wch: Math.max(key.length, ...rows.map((r) => String(r[key as keyof typeof r] ?? "").length)),
      }))
      ws["!cols"] = colWidths
      XLSX.writeFile(wb, `annuaire-ansut-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } finally {
      setExportingXlsx(false)
    }
  }

  const favCount = favorites.size

  if (!mounted) return <SkeletonGrid count={12} />

  return (
    <>
      {/* Search bar */}
      <div className="mb-4">
        <SearchBox employees={employees} value={search} onChange={setSearch} />
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="text-xs px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-full bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(SORT_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowFavoritesOnly((v) => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
            showFavoritesOnly
              ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300"
              : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-yellow-300"
          }`}
        >
          ⭐ Favoris{" "}
          {favCount > 0 && (
            <span className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded-full px-1.5 font-semibold">
              {favCount}
            </span>
          )}
        </button>

        <button
          onClick={exportExcel}
          disabled={exportingXlsx || filtered.length === 0}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-green-400 hover:text-green-700 dark:hover:text-green-400 disabled:opacity-50 transition-all"
          title="Exporter la liste en Excel"
        >
          {exportingXlsx ? "⏳" : "📊"} Excel
        </button>

        <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">
          {filtered.length} agent{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Advanced filters */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <AdvancedFilterChip
          label="Sans photo"
          active={filterNoPhoto}
          onClick={() => setFilterNoPhoto((v) => !v)}
        />
        <AdvancedFilterChip
          label="Sans mobile"
          active={filterNoMobile}
          onClick={() => setFilterNoMobile((v) => !v)}
        />
        <AdvancedFilterChip
          label="Sans email"
          active={filterNoEmail}
          onClick={() => setFilterNoEmail((v) => !v)}
        />
      </div>

      {/* Direction filters */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <FilterChip
          label={`Tous (${employees.length})`}
          active={!selectedDirection}
          onClick={() => setSelectedDirection(null)}
        />
        {directions.map((dir) => {
          const count = employees.filter((e) => e.direction === dir).length
          const short = dir.replace(/\s*\(.*?\)\s*/g, "").trim()
          return (
            <FilterChip
              key={dir}
              label={`${short} (${count})`}
              active={selectedDirection === dir}
              onClick={() => setSelectedDirection(selectedDirection === dir ? null : dir)}
            />
          )
        })}
      </div>

      {/* Site filters */}
      {sites.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          <FilterChip
            label="Tous les sites"
            active={!selectedSite}
            onClick={() => setSelectedSite(null)}
          />
          {sites.map((site) => {
            const count = employees.filter((e) => e.site === site.name).length
            return (
              <FilterChip
                key={site.id}
                label={`${site.name} (${count})`}
                active={selectedSite === site.id}
                onClick={() => setSelectedSite(selectedSite === site.id ? null : site.id)}
              />
            )
          })}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">Aucun résultat</p>
          <p className="text-sm mt-1">Essayez un autre terme de recherche</p>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {Object.entries(grouped).map(([direction, group]) => (
              <section key={direction}>
                {direction && (
                  <h2 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
                    {direction}
                    <span className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {group.map((emp) => (
                    <EmployeeCard
                      key={emp.id}
                      employee={emp}
                      isFavorite={favorites.has(emp.id)}
                      isAdmin={isAdmin}
                      onClick={() => setSelected(emp)}
                      onToggleFavorite={toggleFavorite}
                      onEdit={(e) => setEditing(e)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Load more */}
          {filtered.length > visibleCount && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="px-6 py-2 rounded-full border-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                Voir plus ({filtered.length - visibleCount} restants)
              </button>
            </div>
          )}
        </>
      )}

      <EmployeeModal
        employee={selected}
        allEmployees={employees}
        isFavorite={selected ? favorites.has(selected.id) : false}
        isAdmin={isAdmin}
        onClose={() => setSelected(null)}
        onToggleFavorite={toggleFavorite}
        onEdit={handleEditFromModal}
        onSelectEmployee={(emp) => setSelected(emp)}
      />

      {editing && (
        <EmployeeForm employee={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
    </>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
        active
          ? "bg-blue-700 text-white border-blue-700 shadow-sm"
          : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-400"
      }`}
    >
      {label}
    </button>
  )
}

function AdvancedFilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
        active
          ? "bg-orange-500 text-white border-orange-500 shadow-sm"
          : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-orange-300 hover:text-orange-600 dark:hover:text-orange-400"
      }`}
    >
      {label}
    </button>
  )
}
