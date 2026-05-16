"use client"

import { useState, useMemo, useEffect, createContext, useContext, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Employee } from "@/lib/types"
import EmployeeModal from "@/components/EmployeeModal"

type DisplayMode = "tree" | "list" | "chart"

// ── Drag-and-drop context ─────────────────────────────────────────────────────

type DragCtx = {
  isAdmin: boolean
  draggedId: number | null
  dropTargetId: number | null
  dropTargetDir: string | null
  onDragStart: (id: number, e: React.DragEvent) => void
  onDragEnd: () => void
  onDragOverCard: (id: number, e: React.DragEvent) => void
  onDragLeaveCard: () => void
  onDropOnCard: (targetId: number) => void
  onDragOverSection: (dir: string, e: React.DragEvent) => void
  onDragLeaveSection: () => void
  onDropOnSection: (dir: string) => void
}

const DragContext = createContext<DragCtx | null>(null)
function useDrag() {
  return useContext(DragContext)!
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function norm(s: string | null | undefined) {
  return (s ?? "").toLowerCase().trim().replace(/\s+/g, " ")
}

type OrgNode = { employee: Employee; children: OrgNode[] }

function buildLocalTree(members: Employee[]): OrgNode[] {
  const byName = new Map<string, Employee>()
  members.forEach((e) => { if (e.nom) byName.set(norm(e.nom), e) })
  const nodes = new Map<number, OrgNode>()
  members.forEach((e) => nodes.set(e.id, { employee: e, children: [] }))
  const memberNames = new Set(members.map((e) => norm(e.nom)))
  const roots: OrgNode[] = []
  members.forEach((e) => {
    const node = nodes.get(e.id)!
    const managerName = norm(e.manager)
    const managerInGroup = e.manager && memberNames.has(managerName)
    if (!managerInGroup) {
      roots.push(node)
    } else {
      const mgr = byName.get(managerName)
      if (mgr) nodes.get(mgr.id)?.children.push(node)
      else roots.push(node)
    }
  })
  return roots
}

const DIR_COLORS: Record<string, string> = {
  "Présidence Du Conseil D'administration (PCA)": "#7c3aed",
  "Direction Générale (DG)": "#1d4ed8",
  "Direction Générale Adjointe (DGA)": "#2563eb",
  "Direction Générale (DG) / Etat Major": "#3b82f6",
  "Direction Juridique et Moyens Généraux (DJMG)": "#16a34a",
  "Direction Des Affaires Financières (DAF)": "#ca8a04",
  "Département Des Ressources Humaines Et Compétences (DRHCOM)": "#ea580c",
  "Direction Développement des Infrastructures et RNHD (DDIR)": "#dc2626",
  "Direction Solutions et Intégrations des Services (DSIS)": "#6366f1",
  "Direction de la Transformation Digitale et Innovation (DTDI)": "#0891b2",
}
function dirColor(d: string) { return DIR_COLORS[d] ?? "#64748b" }

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ employee, size = "sm" }: { employee: Employee; size?: "sm" | "md" }) {
  const initials = (() => {
    const parts = (employee.nom ?? "?").trim().split(" ")
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase()
  })()
  const cls = size === "md" ? "w-12 h-12 text-lg" : "w-9 h-9 text-sm"
  return (
    <>
      {employee.photo && (
        <img
          src={employee.photo}
          alt={employee.nom ?? ""}
          className={`${cls} rounded-full object-cover border-2 border-white dark:border-slate-700 shadow flex-shrink-0`}
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.display = "none"
            el.nextElementSibling?.classList.remove("hidden")
          }}
        />
      )}
      <div className={`${cls} rounded-full bg-blue-700 flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-700 shadow flex-shrink-0 ${employee.photo ? "hidden" : ""}`}>
        {initials}
      </div>
    </>
  )
}

// ── Drag handle icon ──────────────────────────────────────────────────────────

function DragHandle() {
  return (
    <span className="flex-shrink-0 opacity-30 group-hover:opacity-60 cursor-grab active:cursor-grabbing select-none text-gray-400 text-xs leading-none">
      ⠿
    </span>
  )
}

// ── TREE MODE ─────────────────────────────────────────────────────────────────

function TreeOrgNode({
  node, depth, onSelect, color,
}: {
  node: OrgNode; depth: number; onSelect: (e: Employee) => void; color: string
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const drag = useDrag()
  const emp = node.employee
  const hasChildren = node.children.length > 0
  const isRoot = depth === 0
  const isDragging = drag.draggedId === emp.id
  const isDropTarget = drag.dropTargetId === emp.id

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-2">
        {!isRoot && (
          <div className="flex flex-col items-center flex-shrink-0 pt-4">
            <div className="w-px flex-1 bg-gray-200 dark:bg-slate-700" style={{ minHeight: 20 }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className={`group flex items-center gap-2 rounded-xl border transition-all hover:shadow-md ${
              isRoot
                ? "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-3 shadow-sm"
                : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 p-2.5"
            } ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "ring-2 ring-offset-1" : ""}`}
            style={isDropTarget ? { ringColor: color } as React.CSSProperties : undefined}
            draggable={drag.isAdmin}
            onDragStart={(e) => drag.onDragStart(emp.id, e)}
            onDragEnd={drag.onDragEnd}
            onDragOver={(e) => drag.onDragOverCard(emp.id, e)}
            onDragLeave={drag.onDragLeaveCard}
            onDrop={() => drag.onDropOnCard(emp.id)}
          >
            {drag.isAdmin && <DragHandle />}
            <button onClick={() => onSelect(emp)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
              <Avatar employee={emp} size={isRoot ? "md" : "sm"} />
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors truncate ${isRoot ? "text-sm" : "text-xs"}`}>
                  {emp.nom}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{emp.fonction}</p>
              </div>
            </button>
            {hasChildren && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                style={{ background: color }}
              >
                {expanded ? "−" : `+${node.children.length}`}
              </button>
            )}
          </div>
          {hasChildren && expanded && (
            <div className="mt-1 ml-5 pl-4 border-l-2 space-y-1" style={{ borderColor: color + "50" }}>
              {node.children.map((child) => (
                <TreeOrgNode key={child.employee.id} node={child} depth={depth + 1} onSelect={onSelect} color={color} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── LIST MODE ─────────────────────────────────────────────────────────────────

function ListRow({ employee, onSelect, color }: { employee: Employee; onSelect: (e: Employee) => void; color: string }) {
  const drag = useDrag()
  const isDragging = drag.draggedId === employee.id
  const isDropTarget = drag.dropTargetId === employee.id

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-400" : "hover:bg-gray-50 dark:hover:bg-slate-700/50"}`}
      draggable={drag.isAdmin}
      onDragStart={(e) => drag.onDragStart(employee.id, e)}
      onDragEnd={drag.onDragEnd}
      onDragOver={(e) => drag.onDragOverCard(employee.id, e)}
      onDragLeave={drag.onDragLeaveCard}
      onDrop={() => drag.onDropOnCard(employee.id)}
    >
      {drag.isAdmin && <DragHandle />}
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <Avatar employee={employee} size="sm" />
      <button onClick={() => onSelect(employee)} className="min-w-0 flex-1 text-left">
        <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">
          {employee.nom}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{employee.fonction}</p>
      </button>
      {employee.manager && (
        <p className="text-[10px] text-gray-400 dark:text-slate-500 flex-shrink-0 hidden sm:block truncate max-w-[120px]">
          ↑ {employee.manager}
        </p>
      )}
    </div>
  )
}

// ── CHART MODE ────────────────────────────────────────────────────────────────

function ChartOrgNode({ node, onSelect, color }: { node: OrgNode; onSelect: (e: Employee) => void; color: string }) {
  const [expanded, setExpanded] = useState(true)
  const drag = useDrag()
  const emp = node.employee
  const hasChildren = node.children.length > 0
  const n = node.children.length
  const isDragging = drag.draggedId === emp.id
  const isDropTarget = drag.dropTargetId === emp.id

  return (
    <div className="flex flex-col items-center">
      <div
        className={`group w-36 bg-white dark:bg-slate-800 border-2 rounded-xl p-2.5 shadow-sm hover:shadow-md transition-all flex-shrink-0 ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "ring-2 ring-offset-1" : ""}`}
        style={{ borderColor: color, ...(isDropTarget ? { outline: `2px solid ${color}` } : {}) }}
        draggable={drag.isAdmin}
        onDragStart={(e) => drag.onDragStart(emp.id, e)}
        onDragEnd={drag.onDragEnd}
        onDragOver={(e) => drag.onDragOverCard(emp.id, e)}
        onDragLeave={drag.onDragLeaveCard}
        onDrop={() => drag.onDropOnCard(emp.id)}
      >
        {drag.isAdmin && (
          <div className="flex justify-end mb-0.5">
            <DragHandle />
          </div>
        )}
        <button onClick={() => onSelect(emp)} className="w-full text-left">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Avatar employee={emp} size="sm" />
          </div>
          <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate leading-tight">
            {emp.nom}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate leading-tight mt-0.5">
            {emp.fonction}
          </p>
        </button>
      </div>

      {hasChildren && (
        <div className="flex flex-col items-center">
          <div className="w-px h-2" style={{ background: color + "70" }} />
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ borderColor: color, color }}
          >
            {expanded ? "−" : `+${n}`}
          </button>
          {expanded && (
            <>
              <div className="w-px h-2" style={{ background: color + "70" }} />
              <div className="relative flex gap-3">
                {n > 1 && (
                  <div
                    className="absolute top-0 h-px"
                    style={{ background: color + "70", left: `${50 / n}%`, right: `${50 / n}%` }}
                  />
                )}
                {node.children.map((child) => (
                  <div key={child.employee.id} className="flex flex-col items-center">
                    <div className="w-px h-4" style={{ background: color + "70" }} />
                    <ChartOrgNode node={child} onSelect={onSelect} color={color} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Direction section ─────────────────────────────────────────────────────────

function DirectionSection({
  direction, members, onSelect, mode,
}: {
  direction: string; members: Employee[]; onSelect: (e: Employee) => void; mode: DisplayMode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const drag = useDrag()
  const tree = useMemo(() => buildLocalTree(members), [members])
  const color = dirColor(direction)
  const short = direction.replace(/\s*\(.*?\)\s*/g, "").trim()
  const isDropTarget = drag.dropTargetDir === direction

  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Section header — also a drop target to remove manager */}
      <div
        className={`flex items-center gap-3 px-5 py-3.5 transition-all ${isDropTarget ? "brightness-125 ring-4 ring-white/40 ring-inset" : ""}`}
        style={{ background: color }}
        onDragOver={(e) => drag.onDragOverSection(direction, e)}
        onDragLeave={drag.onDragLeaveSection}
        onDrop={() => drag.onDropOnSection(direction)}
      >
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex-1 min-w-0 text-left"
        >
          <h2 className="text-sm font-bold text-white truncate">{short}</h2>
          <p className="text-xs text-white/70">
            {members.length} agent{members.length > 1 ? "s" : ""}
            {isDropTarget && drag.isAdmin && (
              <span className="ml-2 font-semibold text-white">→ Déposer ici pour retirer le manager</span>
            )}
          </p>
        </button>
        <span className="text-white/80 text-lg flex-shrink-0">{collapsed ? "+" : "−"}</span>
      </div>

      {!collapsed && (
        <>
          {mode === "tree" && (
            <div className="p-4 space-y-2">
              {tree.map((node) => (
                <TreeOrgNode key={node.employee.id} node={node} depth={0} onSelect={onSelect} color={color} />
              ))}
            </div>
          )}
          {mode === "list" && (
            <div className="p-2">
              {members.map((emp) => (
                <ListRow key={emp.id} employee={emp} onSelect={onSelect} color={color} />
              ))}
            </div>
          )}
          {mode === "chart" && (
            <div className="p-6 overflow-x-auto">
              <div className="flex gap-10 min-w-max pb-2">
                {tree.map((node) => (
                  <ChartOrgNode key={node.employee.id} node={node} onSelect={onSelect} color={color} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const MODES: { id: DisplayMode; label: string }[] = [
  { id: "tree", label: "Arbre" },
  { id: "list", label: "Liste" },
  { id: "chart", label: "Organigramme" },
]

export default function OrganigrammePage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  const [employees, setEmployees] = useState<Employee[]>([])
  const [selected, setSelected] = useState<Employee | null>(null)

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEmployees(data as Employee[]) })
      .catch(() => {})
  }, [])
  const [search, setSearch] = useState("")
  const [filterDir, setFilterDir] = useState<string | null>(null)
  const [mode, setMode] = useState<DisplayMode>("tree")

  // Drag state
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)
  const [dropTargetDir, setDropTargetDir] = useState<string | null>(null)

  const DIRECTIONS = useMemo(
    () => Array.from(new Set(employees.map((e) => e.direction).filter(Boolean))) as string[],
    [employees]
  )

  const byDirection = useMemo(() => {
    const q = norm(search)
    const filtered = q
      ? employees.filter((e) => norm(e.nom).includes(q) || norm(e.fonction).includes(q))
      : employees
    return DIRECTIONS.reduce<Record<string, Employee[]>>((acc, dir) => {
      if (filterDir && dir !== filterDir) return acc
      const members = filtered.filter((e) => e.direction === dir)
      if (members.length > 0) acc[dir] = members
      return acc
    }, {})
  }, [search, filterDir, DIRECTIONS, employees])

  const updateManager = useCallback(async (employeeId: number, newManager: string) => {
    // Optimistic update
    setEmployees((prev) => prev.map((e) => e.id === employeeId ? { ...e, manager: newManager } : e))
    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manager: newManager }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // Revert by re-fetching fresh data from server
      fetch("/api/employees")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setEmployees(data as Employee[]) })
        .catch(() => {})
    }
  }, [])

  const dragCtx: DragCtx = {
    isAdmin,
    draggedId,
    dropTargetId,
    dropTargetDir,
    onDragStart: (id, e) => {
      setDraggedId(id)
      e.dataTransfer.effectAllowed = "move"
    },
    onDragEnd: () => {
      setDraggedId(null)
      setDropTargetId(null)
      setDropTargetDir(null)
    },
    onDragOverCard: (id, e) => {
      if (draggedId === null || draggedId === id) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setDropTargetId(id)
      setDropTargetDir(null)
    },
    onDragLeaveCard: () => setDropTargetId(null),
    onDropOnCard: (targetId) => {
      if (draggedId === null || draggedId === targetId) return
      const target = employees.find((e) => e.id === targetId)
      if (!target?.nom) return
      updateManager(draggedId, target.nom)
      setDraggedId(null)
      setDropTargetId(null)
    },
    onDragOverSection: (dir, e) => {
      if (draggedId === null) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setDropTargetDir(dir)
      setDropTargetId(null)
    },
    onDragLeaveSection: () => setDropTargetDir(null),
    onDropOnSection: (dir) => {
      if (draggedId === null) return
      // Find dragged employee's direction to check if cross-direction
      const dragged = employees.find((e) => e.id === draggedId)
      if (!dragged) return
      // Update: remove manager, update direction if needed
      const updates: Partial<Employee> = { manager: "" }
      if (dragged.direction !== dir) updates.direction = dir
      const snapshot = employees
      setEmployees((prev) => prev.map((e) => e.id === draggedId ? { ...e, ...updates } : e))
      fetch(`/api/employees/${draggedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch(() => setEmployees(snapshot))
      setDraggedId(null)
      setDropTargetDir(null)
    },
  }

  return (
    <DragContext.Provider value={dragCtx}>
      {/* Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Organigramme ANSUT</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Cliquez sur une fiche pour voir les détails
            {isAdmin && <span className="ml-2 text-blue-600 dark:text-blue-400">· Glisser-déposer pour réorganiser</span>}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-700/60 rounded-xl p-1 gap-0.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === m.id
                    ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer un agent…"
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Direction filter */}
          <select
            value={filterDir ?? ""}
            onChange={(e) => setFilterDir(e.target.value || null)}
            className="text-xs px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les directions</option>
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>{d.replace(/\s*\(.*?\)\s*/g, "").trim()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Direction sections */}
      <div className={mode === "tree" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "flex flex-col gap-4"}>
        {Object.entries(byDirection).map(([direction, members]) => (
          <DirectionSection
            key={direction}
            direction={direction}
            members={members}
            onSelect={setSelected}
            mode={mode}
          />
        ))}
      </div>

      {Object.keys(byDirection).length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          <p className="text-3xl mb-2">⌕</p>
          <p className="font-medium">Aucun résultat pour &quot;{search}&quot;</p>
        </div>
      )}

      <EmployeeModal
        employee={selected}
        allEmployees={employees}
        onClose={() => setSelected(null)}
        onSelectEmployee={(emp) => setSelected(emp)}
      />
    </DragContext.Provider>
  )
}
