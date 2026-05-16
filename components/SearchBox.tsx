"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Fuse from "fuse.js"
import { Employee } from "@/lib/types"

const HISTORY_KEY = "ansut_search_history"
const MAX_HISTORY = 6

type Props = {
  employees: Employee[]
  value: string
  onChange: (v: string) => void
}

function getInitials(name: string) {
  const parts = name.trim().split(" ")
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}

export default function SearchBox({ employees, value, onChange }: Props) {
  const [focused, setFocused] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fuse = useMemo(
    () =>
      new Fuse(employees, {
        keys: ["nom", "fonction", "email", "contact"],
        threshold: 0.38,
        minMatchCharLength: 2,
        includeScore: true,
      }),
    [employees]
  )

  const suggestions = useMemo(() => {
    if (value.length < 2) return []
    return fuse.search(value, { limit: 6 }).map((r) => r.item)
  }, [value, fuse])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) setHistory(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setFocused(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function saveToHistory(term: string) {
    if (!term.trim()) return
    const next = [term, ...history.filter((h) => h !== term)].slice(0, MAX_HISTORY)
    setHistory(next)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  }

  function handleSelect(val: string) {
    saveToHistory(val)
    onChange(val)
    setFocused(false)
  }

  function clearHistory() {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  const showDropdown = focused && (suggestions.length > 0 || (value === "" && history.length > 0))

  return (
    <div ref={containerRef} className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
        🔍
      </span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            saveToHistory(value.trim())
            setFocused(false)
          }
          if (e.key === "Escape") {
            setFocused(false)
            inputRef.current?.blur()
          }
        }}
        placeholder="Rechercher par nom, fonction, email ou mobile..."
        autoComplete="off"
        className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm transition-shadow"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-xl leading-none"
        >
          ×
        </button>
      )}

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-2xl z-30 overflow-hidden">
          {suggestions.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-700 font-medium uppercase tracking-wide">
                Suggestions
              </div>
              {suggestions.map((emp) => (
                <button
                  key={emp.id}
                  onMouseDown={() => handleSelect(emp.nom ?? "")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 text-left transition-colors group"
                >
                  {emp.photo ? (
                    <img
                      src={emp.photo}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {getInitials(emp.nom ?? "?")}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium truncate group-hover:text-blue-700 dark:group-hover:text-blue-400">
                      {emp.nom}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{emp.fonction}</p>
                  </div>
                  <span className="text-xs text-gray-300 dark:text-slate-600 flex-shrink-0">
                    {emp.direction?.replace(/\s*\(.*?\)\s*/g, "").trim().slice(0, 10)}
                  </span>
                </button>
              ))}
            </>
          )}

          {value === "" && history.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-700 font-medium uppercase tracking-wide flex items-center justify-between">
                Recherches récentes
                <button
                  onMouseDown={clearHistory}
                  className="text-red-400 hover:text-red-600 normal-case tracking-normal"
                >
                  Effacer
                </button>
              </div>
              {history.map((h) => (
                <button
                  key={h}
                  onMouseDown={() => handleSelect(h)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 text-left transition-colors"
                >
                  <span className="text-base w-8 text-center">🕐</span>
                  <span className="text-sm text-gray-700 dark:text-slate-300">{h}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
