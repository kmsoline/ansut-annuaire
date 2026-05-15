"use client"

import { useEffect, useRef } from "react"
import type { Map as LeafletMap, Marker } from "leaflet"
import { Site } from "@/lib/types"

type Props = {
  sites: Site[]
  activeSiteId: string | null
  onSelectSite: (id: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletLib = any

function makeIcon(L: LeafletLib, color: string, active: boolean) {
  const size = active ? 44 : 36
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50% 50% 50% 0;
      background:${color};
      transform:rotate(-45deg);
      border:${active ? "4px" : "3px"} solid white;
      box-shadow:${active ? "0 4px 16px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.25)"};
      transition:all 0.2s;
    "></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

export default function SiteMapInteractive({ sites, activeSiteId, onSelectSite }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Map<string, Marker>>(new Map())

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Fix webpack icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const lats = sites.map((s) => s.lat)
      const lngs = sites.map((s) => s.lng)
      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length

      const map = L.map(mapRef.current!, { center: [centerLat, centerLng], zoom: 13 })
      mapInstanceRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      sites.forEach((site) => {
        const marker = L.marker([site.lat, site.lng], {
          icon: makeIcon(L, site.color, site.id === activeSiteId),
        })
          .addTo(map)
          .on("click", () => onSelectSite(site.id))

        marker.bindTooltip(site.name, { permanent: false, direction: "top", offset: [0, -36] })
        markersRef.current.set(site.id, marker)
      })

      if (sites.length > 1) {
        const bounds = L.latLngBounds(sites.map((s) => [s.lat, s.lng] as [number, number]))
        map.fitBounds(bounds, { padding: [60, 60] })
      }
    })

    // Capture refs in local variables for cleanup
    const mapInst = mapInstanceRef
    const markers = markersRef
    return () => {
      mapInst.current?.remove()
      mapInst.current = null
      markers.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update marker icons when activeSiteId changes
  useEffect(() => {
    if (!mapInstanceRef.current) return
    import("leaflet").then((L) => {
      sites.forEach((site) => {
        const marker = markersRef.current.get(site.id)
        if (marker) {
          marker.setIcon(makeIcon(L, site.color, site.id === activeSiteId))
        }
      })
      if (activeSiteId) {
        const site = sites.find((s) => s.id === activeSiteId)
        if (site) {
          mapInstanceRef.current?.panTo([site.lat, site.lng], { animate: true })
        }
      }
    })
  }, [activeSiteId, sites])

  // Update marker positions when site coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return
    import("leaflet").then((L) => {
      const map = mapInstanceRef.current
      if (!map) return

      sites.forEach((site) => {
        const existing = markersRef.current.get(site.id)
        if (existing) {
          existing.setLatLng([site.lat, site.lng])
          existing.setIcon(makeIcon(L, site.color, site.id === activeSiteId))
        } else {
          // New site added — create its marker
          const marker = L.marker([site.lat, site.lng], {
            icon: makeIcon(L, site.color, false),
          })
            .addTo(map)
            .on("click", () => onSelectSite(site.id))
          marker.bindTooltip(site.name, { permanent: false, direction: "top", offset: [0, -36] })
          markersRef.current.set(site.id, marker)
        }
      })

      // Remove markers for deleted sites
      markersRef.current.forEach((marker, id) => {
        if (!sites.find((s) => s.id === id)) {
          marker.remove()
          markersRef.current.delete(id)
        }
      })

      // Re-fit bounds
      if (sites.length > 1) {
        const bounds = L.latLngBounds(sites.map((s) => [s.lat, s.lng] as [number, number]))
        map.fitBounds(bounds, { padding: [60, 60] })
      } else if (sites.length === 1) {
        map.setView([sites[0].lat, sites[0].lng], 16)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} className="w-full h-full min-h-[380px]" />
    </>
  )
}
