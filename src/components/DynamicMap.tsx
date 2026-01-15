'use client'

import dynamic from 'next/dynamic'

// Dynamisk import för att undvika SSR-problem med Leaflet
const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '450px',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#888'
    }}>
      Laddar historisk karta...
    </div>
  )
})

interface DynamicMapProps {
  position: { lat: number; lng: number } | null
  onPositionChange: (lat: number, lng: number) => void
  selectedPeriod?: string
}

export default function DynamicMap({ position, onPositionChange, selectedPeriod }: DynamicMapProps) {
  return <MapPicker position={position} onPositionChange={onPositionChange} selectedPeriod={selectedPeriod} />
}
