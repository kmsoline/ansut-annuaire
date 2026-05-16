"use client"

import { Employee } from "@/lib/types"

type Props = {
  employee: Employee
  isFavorite: boolean
  isAdmin?: boolean
  onClick: () => void
  onToggleFavorite: (id: number) => void
  onEdit?: (employee: Employee) => void
}

function getInitials(name: string) {
  const parts = name.trim().split(" ")
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}

const DIR_COLORS: Record<string, string> = {
  "Présidence Du Conseil D'administration (PCA)": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Direction Générale (DG)": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Direction Générale Adjointe (DGA)": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Direction Générale (DG) / Etat Major": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Direction Juridique et Moyens Généraux (DJMG)": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Direction Des Affaires Financières (DAF)": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  "Département Des Ressources Humaines Et Compétences (DRHCOM)": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Direction Développement des Infrastructures et RNHD (DDIR)": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  "Direction Solutions et Intégrations des Services (DSIS)": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "Direction de la Transformation Digitale et Innovation (DTDI)": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
}

export default function EmployeeCard({ employee, isFavorite, isAdmin, onClick, onToggleFavorite, onEdit }: Props) {
  const colorClass = employee.direction
    ? (DIR_COLORS[employee.direction] ?? "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300")
    : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300"

  const shortDir = employee.direction?.replace(/\s*\(.*?\)\s*/g, "").trim()

  function handleCopyPhone(e: React.MouseEvent) {
    e.stopPropagation()
    if (employee.contact) navigator.clipboard.writeText(employee.contact)
  }

  return (
    <div
      className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Favorite star */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(employee.id) }}
        className="absolute top-3 right-3 text-lg leading-none transition-transform hover:scale-125"
        title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        {isFavorite ? "⭐" : "☆"}
      </button>

      {/* Admin edit button */}
      {isAdmin && onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(employee) }}
          className="absolute top-3 right-9 text-sm leading-none opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 rounded-full p-1 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          title="Modifier la fiche"
        >
          ✏️
        </button>
      )}

      <div className="flex items-start gap-3 pr-6">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          {employee.photo ? (
            <img
              src={employee.photo}
              alt={employee.nom ?? ""}
              className="w-14 h-14 rounded-full object-cover bg-gray-100"
              onError={(e) => {
                const img = e.target as HTMLImageElement
                img.style.display = "none"
                img.nextElementSibling?.classList.remove("hidden")
              }}
            />
          ) : null}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-blue-700 text-white ${employee.photo ? "hidden" : ""}`}>
            {getInitials(employee.nom ?? "?")}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            {employee.nom}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">
            {employee.fonction}
          </p>

          <div className="mt-2 space-y-1">
            {employee.contact && (
              <button
                onClick={handleCopyPhone}
                className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/copy w-full text-left"
                title="Copier le numéro"
              >
                <span>📞</span>
                <span>{employee.contact}</span>
                <span className="ml-auto opacity-0 group-hover/copy:opacity-100 text-gray-400 text-xs">copier</span>
              </button>
            )}
            {employee.extension && (
              <p className="text-xs text-gray-600 dark:text-slate-300 flex items-center gap-1">
                <span>☎</span> Poste {employee.extension}
              </p>
            )}
          </div>
        </div>
      </div>

      {shortDir && (
        <div className="mt-3">
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
            {shortDir}
          </span>
        </div>
      )}
    </div>
  )
}
