"use client"

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  type: ToastType
  message: string
  removing?: boolean
}

interface ToastContextValue {
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Config ───────────────────────────────────────────────────────────────────

const MAX_TOASTS = 4
const AUTO_DISMISS_MS = 3000
const SLIDE_OUT_MS = 300

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
}

const STYLES: Record<ToastType, string> = {
  success: "bg-green-600 border-green-500",
  error: "bg-red-600 border-red-500",
  info: "bg-blue-600 border-blue-500",
}

const ICON_STYLES: Record<ToastType, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Toast Item ───────────────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-white text-sm
        max-w-sm w-full pointer-events-auto
        transition-all duration-300 ease-in-out
        ${STYLES[toast.type]}
        ${toast.removing
          ? "opacity-0 translate-x-full scale-95"
          : "opacity-100 translate-x-0 scale-100"
        }
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <span
        className={`
          flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
          text-xs font-bold mt-0.5 ${ICON_STYLES[toast.type]}
        `}
      >
        {ICONS[toast.type]}
      </span>

      {/* Message */}
      <p className="flex-1 leading-snug">{toast.message}</p>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-1 text-base leading-none"
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  )
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    // Start slide-out animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    )
    // Remove after animation completes
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      timersRef.current.delete(id)
    }, SLIDE_OUT_MS)
    timersRef.current.set(`rm-${id}`, timer)
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = generateId()
      setToasts((prev) => {
        const next = [{ id, type, message }, ...prev]
        // Keep only MAX_TOASTS; remove oldest if over limit
        if (next.length > MAX_TOASTS) {
          const removed = next.splice(MAX_TOASTS)
          removed.forEach((t) => {
            const existingTimer = timersRef.current.get(t.id)
            if (existingTimer) clearTimeout(existingTimer)
          })
        }
        return next
      })

      // Auto-dismiss
      const timer = setTimeout(() => removeToast(id), AUTO_DISMISS_MS)
      timersRef.current.set(id, timer)
    },
    [removeToast]
  )

  // Cleanup on unmount
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const value: ToastContextValue = {
    success: (msg) => addToast("success", msg),
    error: (msg) => addToast("error", msg),
    info: (msg) => addToast("info", msg),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast list — top-right, fixed */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>")
  }
  return ctx
}

// ─── Client wrapper for server layout ────────────────────────────────────────

export function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
