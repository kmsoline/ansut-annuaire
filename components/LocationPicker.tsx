"use client"

import { useEffect, useRef } from "react"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type L = any

type Props = {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}

export default function LocationPicker({ lat, lng, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import("leaflet").then((Leaflet: L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      delete (Leaflet.Icon.Default.prototype as L)._getIconUrl
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const center: [number, number] = lat && lng ? [lat, lng] : [5.3600, -4.0083]
      const map = Leaflet.map(mapRef.current!, { center, zoom: 16 })
      mapInstanceRef.current = map

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (lat && lng) {
        markerRef.current = Leaflet.marker([lat, lng], { draggable: true }).addTo(map)
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current.getLatLng()
          onChange(Math.round(pos.lat * 1e6) / 1e6, Math.round(pos.lng * 1e6) / 1e6)
        })
      }

      map.on("click", (e: L) => {
        const { lat: newLat, lng: newLng } = e.latlng
        const roundedLat = Math.round(newLat * 1e6) / 1e6
        const roundedLng = Math.round(newLng * 1e6) / 1e6
        if (markerRef.current) {
          markerRef.current.setLatLng([roundedLat, roundedLng])
        } else {
          markerRef.current = Leaflet.marker([roundedLat, roundedLng], { draggable: true }).addTo(map)
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current.getLatLng()
            onChange(Math.round(pos.lat * 1e6) / 1e6, Math.round(pos.lng * 1e6) / 1e6)
          })
        }
        onChange(roundedLat, roundedLng)
      })
    })

    const mapInst = mapInstanceRef
    return () => {
      mapInst.current?.remove()
      mapInst.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep marker in sync if parent lat/lng changes from text inputs
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return
    markerRef.current.setLatLng([lat, lng])
  }, [lat, lng])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} className="w-full h-52 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600" />
    </>
  )
}
