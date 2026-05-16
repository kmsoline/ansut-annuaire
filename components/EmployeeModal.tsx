"use client"

import { useEffect, useState } from "react"
import employeesData from "@/data/employees.json"
import { Employee } from "@/lib/types"
import { generateVCard, downloadVCard } from "@/lib/vcard"

const STATIC_EMPLOYEES = employeesData as Employee[]

type Props = {
  employee: Employee | null
  allEmployees?: Employee[]
  isFavorite?: boolean
  isAdmin?: boolean
  onClose: () => void
  onToggleFavorite?: (id: number) => void
  onEdit?: (employee: Employee) => void
  onSelectEmployee?: (employee: Employee) => void
}

function getInitials(name: string) {
  const parts = name.trim().split(" ")
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}

function MiniEmployeeRow({
  emp,
  onClick,
  label,
}: {
  emp: Employee
  onClick: () => void
  label?: string
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-left group"
    >
      {emp.photo ? (
        <img
          src={emp.photo}
          alt=""
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-100 dark:border-slate-700"
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.display = "none"
            el.nextElementSibling?.classList.remove("hidden")
          }}
        />
      ) : null}
      <div
        className={`w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${emp.photo ? "hidden" : ""}`}
      >
        {getInitials(emp.nom ?? "?")}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">
          {emp.nom}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{emp.fonction}</p>
      </div>
      {label && (
        <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">{label}</span>
      )}
      <span className="text-gray-300 dark:text-slate-600 group-hover:text-blue-400 text-sm flex-shrink-0">›</span>
    </button>
  )
}

function Avatar({ employee }: { employee: Employee }) {
  const initials = getInitials(employee.nom ?? "?")
  return (
    <>
      {employee.photo && (
        <img
          src={employee.photo}
          alt={employee.nom ?? ""}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.display = "none"
            el.nextElementSibling?.classList.remove("hidden")
          }}
        />
      )}
      <div
        className={`w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow ${
          employee.photo ? "hidden" : ""
        }`}
      >
        {initials}
      </div>
    </>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
    >
      {copied ? "✓ Copié" : `Copier ${label}`}
    </button>
  )
}

export default function EmployeeModal({
  employee,
  allEmployees,
  isFavorite,
  isAdmin,
  onClose,
  onToggleFavorite,
  onEdit,
  onSelectEmployee,
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const employees = allEmployees ?? STATIC_EMPLOYEES

  // Find manager and direct reports
  const managerEmployee = employee?.manager
    ? employees.find(
        (e) => e.nom?.toLowerCase().trim() === employee.manager?.toLowerCase().trim()
      ) ?? null
    : null

  const directReports = employee
    ? employees.filter(
        (e) => e.manager?.toLowerCase().trim() === employee.nom?.toLowerCase().trim()
      )
    : []

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  useEffect(() => {
    if (!employee) {
      setQrDataUrl(null)
      setShowQr(false)
      return
    }
    import("qrcode").then(({ default: QRCode }) => {
      QRCode.toDataURL(generateVCard(employee), {
        width: 200,
        margin: 1,
        color: { dark: "#1e293b", light: "#ffffff" },
      })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null))
    })
  }, [employee])

  async function exportPdf() {
    if (!employee) return
    setExportingPdf(true)
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF({ format: "a6", orientation: "portrait", unit: "mm" })

      doc.setFillColor(29, 78, 216)
      doc.rect(0, 0, 105, 32, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.setTextColor(255, 255, 255)
      doc.text(employee.nom ?? "", 10, 16, { maxWidth: 85 })
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(187, 210, 255)
      doc.text(employee.fonction ?? "", 10, 23, { maxWidth: 85 })
      doc.setFontSize(7)
      doc.setTextColor(147, 197, 253)
      doc.text("ANSUT", 10, 29)

      doc.setTextColor(30, 41, 59)
      let y = 42

      function infoRow(icon: string, label: string, val: string) {
        doc.setFontSize(7)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(100, 116, 139)
        doc.text(label.toUpperCase(), 10, y)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.setTextColor(30, 41, 59)
        doc.text(`${icon}  ${val}`, 10, y + 5, { maxWidth: 85 })
        y += 13
      }

      if (employee.direction) infoRow("", "Direction", employee.direction.replace(/\s*\(.*?\)\s*/g, "").trim())
      if (employee.email) infoRow("", "Email", employee.email)
      if (employee.contact) infoRow("", "Téléphone", employee.contact)
      if (employee.extension) infoRow("", "Extension", `Poste ${employee.extension}`)
      if (employee.site) infoRow("", "Site", employee.site)
      if (employee.manager) infoRow("", "Manager", employee.manager)

      if (qrDataUrl) {
        doc.addImage(qrDataUrl, "PNG", 68, 100, 28, 28)
        doc.setFontSize(6)
        doc.setTextColor(148, 163, 184)
        doc.text("Scanner pour importer", 68, 130, { maxWidth: 28 })
      }

      doc.setFillColor(241, 245, 249)
      doc.rect(0, 136, 105, 12, "F")
      doc.setFontSize(6)
      doc.setTextColor(148, 163, 184)
      doc.text("Annuaire interne ANSUT — Confidentiel", 10, 143)

      doc.save(`${employee.nom?.replace(/\s+/g, "_") ?? "fiche"}.pdf`)
    } finally {
      setExportingPdf(false)
    }
  }

  if (!employee) return null

  function navigate(emp: Employee) {
    if (onSelectEmployee) {
      onSelectEmployee(emp)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto flex-1">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 pt-6 pb-14 px-6 relative flex-shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl">
              ×
            </button>
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(employee.id)}
                className="absolute top-4 left-4 text-xl"
                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                {isFavorite ? "⭐" : "☆"}
              </button>
            )}
            <p className="text-blue-200 text-xs uppercase tracking-wider line-clamp-1 mt-1">
              {employee.direction}
            </p>
          </div>

          {/* Avatar */}
          <div className="relative -mt-10 px-6 flex items-end gap-4">
            <Avatar employee={employee} />
            <div className="mb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{employee.nom}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">{employee.fonction}</p>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="px-6 pt-4 flex gap-2 flex-wrap">
            {employee.contact && (
              <a
                href={`tel:${employee.contact.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-full transition-colors"
              >
                📞 Appeler
              </a>
            )}
            {employee.email && (
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-full transition-colors"
              >
                ✉ Email
              </a>
            )}
            <button
              onClick={() => downloadVCard(employee)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-full transition-colors"
            >
              📱 Contacts
            </button>
            <button
              onClick={exportPdf}
              disabled={exportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-medium rounded-full transition-colors"
            >
              {exportingPdf ? "⏳" : "📄"} PDF
            </button>
            {isAdmin && onEdit && (
              <button
                onClick={() => onEdit(employee)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-full transition-colors"
              >
                ✏️ Modifier
              </button>
            )}
          </div>

          {/* Contact info */}
          <div className="px-6 py-5 space-y-4">
            {employee.email && (
              <InfoRow icon="✉" label="Email">
                <a
                  href={`mailto:${employee.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {employee.email}
                </a>
                <CopyButton value={employee.email} label="email" />
              </InfoRow>
            )}
            {employee.contact && (
              <InfoRow icon="📞" label="Mobile">
                <a
                  href={`tel:${employee.contact.replace(/\s/g, "")}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {employee.contact}
                </a>
                <CopyButton value={employee.contact} label="numéro" />
              </InfoRow>
            )}
            {employee.extension && (
              <InfoRow icon="☎" label="Extension">
                <span className="text-gray-800 dark:text-slate-200">Poste {employee.extension}</span>
                <CopyButton value={employee.extension} label="poste" />
              </InfoRow>
            )}
            {employee.site && (
              <InfoRow icon="📍" label="Site">
                <span className="text-gray-800 dark:text-slate-200">{employee.site}</span>
              </InfoRow>
            )}
          </div>

          {/* Hiérarchie */}
          {(managerEmployee || directReports.length > 0) && (
            <div className="px-6 pb-5 space-y-4 border-t border-gray-100 dark:border-slate-800 pt-4">
              {/* Manager */}
              {managerEmployee && (
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <span>↑</span> Manager
                  </p>
                  <MiniEmployeeRow
                    emp={managerEmployee}
                    onClick={() => navigate(managerEmployee)}
                  />
                </div>
              )}

              {/* Direct reports */}
              {directReports.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <span>↓</span> Équipe directe
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                      {directReports.length}
                    </span>
                  </p>
                  <div className="space-y-0.5 max-h-56 overflow-y-auto">
                    {directReports.map((emp) => (
                      <MiniEmployeeRow
                        key={emp.id}
                        emp={emp}
                        onClick={() => navigate(emp)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QR Code */}
          <div className="px-6 pb-6">
            <button
              onClick={() => setShowQr((v) => !v)}
              className="w-full flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors border-t border-gray-100 dark:border-slate-800 pt-4"
            >
              <span className="flex items-center gap-1.5">
                <span>📲</span> QR Code — importer le contact
              </span>
              <span>{showQr ? "▲" : "▼"}</span>
            </button>

            {showQr && qrDataUrl && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <img
                  src={qrDataUrl}
                  alt="QR Code contact"
                  className="w-40 h-40 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm"
                />
                <p className="text-xs text-gray-400 dark:text-slate-500 text-center">
                  Scannez pour ajouter{" "}
                  <span className="font-medium text-gray-600 dark:text-slate-300">{employee.nom}</span> à vos contacts
                </p>
                <a
                  href={qrDataUrl}
                  download={`qr-${employee.nom?.replace(/\s+/g, "_")}.png`}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Télécharger le QR code
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg w-7 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
        <div className="text-sm font-medium flex items-center flex-wrap gap-1">{children}</div>
      </div>
    </div>
  )
}
