"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-8 h-8" />

  const isDark = resolvedTheme === "dark"
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Mode clair" : "Mode sombre"}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-100 hover:bg-blue-700 transition-colors"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  )
}
