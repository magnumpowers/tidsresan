'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix för Leaflet marker-ikoner i Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface MapPickerProps {
  position: { lat: number; lng: number } | null
  onPositionChange: (lat: number, lng: number) => void
  selectedPeriod?: string
}

function LocationMarker({ position, onPositionChange }: Omit<MapPickerProps, 'selectedPeriod'>) {
  const [markerPos, setMarkerPos] = useState(position)

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setMarkerPos({ lat, lng })
      onPositionChange(lat, lng)
    },
  })

  useEffect(() => {
    setMarkerPos(position)
  }, [position])

  return markerPos ? (
    <Marker position={[markerPos.lat, markerPos.lng]} icon={icon}>
      <Popup>
        <div style={{ color: '#333', textAlign: 'center' }}>
          <strong>Din plats</strong><br />
          {markerPos.lat.toFixed(4)}°N, {markerPos.lng.toFixed(4)}°E
        </div>
      </Popup>
    </Marker>
  ) : null
}

export default function MapPicker({ position, onPositionChange }: MapPickerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{
        width: '100%',
        height: '400px',
        background: '#f0f0f0',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        Laddar karta...
      </div>
    )
  }

  // Default center: Sverige
  const defaultCenter: [number, number] = position
    ? [position.lat, position.lng]
    : [59.3, 18.0]

  const defaultZoom = position ? 10 : 5

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ width: '100%', height: '400px', borderRadius: '16px' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} onPositionChange={onPositionChange} />
    </MapContainer>
  )
}
