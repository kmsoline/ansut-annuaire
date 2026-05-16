"use client"

import { useEffect, useRef, useState } from "react"
import { Employee } from "@/lib/types"

type Site = {
  name: string
  lat: number
  lng: number
  address: string
  color: string
}

const SITES: Site[] = [
  {
    name: "Siège ANSUT",
    lat: 5.3479,
    lng: -4.0185,
    address: "Plateau, Abidjan",
    color: "#1d4ed8",
  },
  {
    name: "Postel ANSUT",
    lat: 5.3447,
    lng: -4.0152,
    address: "Avenue Terrasson de Fougères, Plateau",
    color: "#7c3aed",
  },
  {
    name: "Annexe ANSUT",
    lat: 5.3613,
    lng: -3.9970,
    address: "Cocody, Abidjan",
    color: "#059669",
  },
]

type Props = {
  employees: Employee[]
  onSelectEmployee: (emp: Employee) => void
}

export default function SiteMap({ employees, onSelectEmployee }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const [activeSite, setActiveSite] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic import of leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Fix default icon path issue with webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center: [5.3479, -4.0150],
        zoom: 13,
        zoomControl: true,
      })
      mapInstanceRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      SITES.forEach((site) => {
        const icon = L.divIcon({
          html: `<div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:${site.color};transform:rotate(-45deg);
            border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        })

        const siteEmployees = employees.filter((e) => e.site === site.name)
        const popupContent = `
          <div style="font-family:system-ui;min-width:200px">
            <div style="font-weight:700;font-size:14px;color:#1e293b;margin-bottom:4px">${site.name}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:8px">📍 ${site.address}</div>
            <div style="font-size:12px;color:#374151;font-weight:600;margin-bottom:4px">
              👥 ${siteEmployees.length} collaborateur${siteEmployees.length > 1 ? "s" : ""}
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}"
              target="_blank"
              rel="noopener noreferrer"
              style="display:inline-flex;align-items:center;gap:4px;font-size:11px;background:#1d4ed8;color:white;padding:4px 10px;border-radius:999px;text-decoration:none;margin-top:4px"
            >
              🗺 Itinéraire
            </a>
          </div>
        `

        L.marker([site.lat, site.lng], { icon })
          .addTo(map)
          .bindPopup(popupContent, { maxWidth: 260 })
          .on("click", () => setActiveSite(site.name))
      })
    })

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (mapInstanceRef.current) { (mapInstanceRef.current as any).remove(); mapInstanceRef.current = null }
    }
  }, [employees])

  const activeSiteData = SITES.find((s) => s.name === activeSite)
  const activeSiteEmployees = activeSite ? employees.filter((e) => e.site === activeSite) : []

  function getInitials(name: string) {
    const parts = name.trim().split(" ")
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase()
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-160px)]">
      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-slate-700 min-h-[380px]">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Side panel */}
      <div className="w-full lg:w-80 flex flex-col gap-3 overflow-y-auto">
        {/* Sites list */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">Sites ANSUT</h3>
          <div className="space-y-2">
            {SITES.map((site) => {
              const count = employees.filter((e) => e.site === site.name).length
              return (
                <button
                  key={site.name}
                  onClick={() => setActiveSite(activeSite === site.name ? null : site.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    activeSite === site.name
                      ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: site.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{site.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{site.address}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 flex-shrink-0 font-medium">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Employees at selected site */}
        {activeSite && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                {activeSite}
              </h3>
              {activeSiteData && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeSiteData.lat},${activeSiteData.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1 px-2.5 py-1 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                >
                  🗺 Itinéraire
                </a>
              )}
            </div>
            <div className="space-y-2">
              {activeSiteEmployees.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-slate-500">Aucun collaborateur assigné</p>
              ) : (
                activeSiteEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-left group"
                  >
                    {emp.photo ? (
                      <img
                        src={emp.photo}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(emp.nom ?? "?")}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">
                        {emp.nom}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{emp.fonction}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
