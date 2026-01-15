'use client'

import { useState, useRef } from 'react'
import DynamicMap from '@/components/DynamicMap'
import { TIME_PERIODS, getPeriodById } from '@/lib/time-periods'

// Förenklade perioder för UI - bara de viktigaste
const SIMPLE_PERIODS = [
  { id: 'stone_early', name: 'Stenåldern', years: '10000 f.Kr.', shortYears: '10000 BC' },
  { id: 'bronze', name: 'Bronsåldern', years: '1700 f.Kr.', shortYears: '1700 BC' },
  { id: 'viking', name: 'Vikingatid', years: '800 e.Kr.', shortYears: '800 AD' },
  { id: 'medieval_early', name: 'Medeltiden', years: '1100 e.Kr.', shortYears: '1100 AD' },
  { id: 'early_modern', name: 'Stormaktstid', years: '1600 e.Kr.', shortYears: '1600 AD' },
  { id: 'industrial', name: '1800-talet', years: '1850 e.Kr.', shortYears: '1850 AD' },
]

interface GenerationResult {
  period: string
  periodId: string
  yearRange: string
  description: string
  locationType: 'urban' | 'coastal' | 'rural'
  locationDescription: string
  nearestCity?: string
  geologicalData?: {
    currentElevation: number
    wasUnderwater: boolean
    totalUplift: number
    seaPhase: { name: string; description: string }
  }
  historicalContext: {
    landscape: string
    vegetation: string
    fauna: string
    buildings: string
    people: string
    technology: string
  }
  generatedImageUrl: string | null
  generatedImageBase64: string | null
  imageGenerationError: string | null
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('viking')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setImage(dataUrl)
      setImageBase64(dataUrl.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  const getLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      () => {},
      { enableHighAccuracy: true }
    )
  }

  const handleGenerate = async () => {
    if (!location) {
      setError('Välj en plats på kartan först')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          period: selectedPeriod,
          imageBase64
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Något gick fel')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel')
    } finally {
      setLoading(false)
    }
  }

  const currentPeriod = getPeriodById(selectedPeriod)

  return (
    <main className="container">
      {/* Hero */}
      <div className="hero">
        <h1>Tidsresan</h1>
        <p className="subtitle">
          Se hur din plats såg ut för tusentals år sedan
        </p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`progress-step ${image ? 'completed' : 'active'}`}>
          <span className="step-number">{image ? '✓' : '1'}</span>
          <span>Ta ett foto</span>
        </div>
        <div className={`progress-step ${location ? 'completed' : image ? 'active' : ''}`}>
          <span className="step-number">{location ? '✓' : '2'}</span>
          <span>Välj plats</span>
        </div>
        <div className={`progress-step ${result ? 'completed' : location ? 'active' : ''}`}>
          <span className="step-number">{result ? '✓' : '3'}</span>
          <span>Res i tiden</span>
        </div>
      </div>

      {/* Step 1: Upload Photo */}
      <div className="card">
        <h2>1. Ta ett foto av din vy</h2>
        <p>Vi transformerar ditt foto till hur det såg ut i en annan tid.</p>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />

        <div
          className={`upload-area ${image ? 'has-image' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <img src={image} alt="Din bild" className="preview-image" />
          ) : (
            <>
              <div className="upload-icon">📷</div>
              <h3>Klicka för att ta foto</h3>
              <p>eller välj en bild från din enhet</p>
            </>
          )}
        </div>

        {image && (
          <button
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            style={{ marginTop: '16px' }}
          >
            Byt foto
          </button>
        )}
      </div>

      {/* Step 2: Choose Location */}
      <div className="card">
        <h2>2. Var är du?</h2>
        <p>Klicka på kartan eller använd din GPS-position.</p>

        <div className="map-container">
          <DynamicMap
            position={location}
            onPositionChange={(lat, lng) => setLocation({ lat, lng })}
            selectedPeriod={selectedPeriod}
          />
        </div>

        <div className="map-info">
          {location ? (
            <span className="location-display">
              <strong>Vald plats:</strong> {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
            </span>
          ) : (
            <span className="location-display">Ingen plats vald</span>
          )}
          <button className="btn-secondary" onClick={getLocation}>
            📍 Min position
          </button>
        </div>
      </div>

      {/* Step 3: Choose Time Period */}
      <div className="card">
        <h2>3. Välj tidsperiod</h2>
        <p>Hur långt tillbaka vill du resa?</p>

        <div className="timeline-periods">
          {SIMPLE_PERIODS.map((period) => (
            <button
              key={period.id}
              className={`period-btn ${selectedPeriod === period.id ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period.id)}
            >
              <span className="period-name">{period.name}</span>
              <span className="period-years">{period.years}</span>
            </button>
          ))}
        </div>

        {currentPeriod && (
          <div className="selected-period-preview">
            <h3>{currentPeriod.name}</h3>
            <p className="years">{currentPeriod.yearLabel}</p>
            <p className="description">{currentPeriod.description}</p>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="cta-section">
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading || !location}
        >
          {loading ? (
            <>⏳ Skapar din tidsresa...</>
          ) : (
            <>✨ Skapa tidsresa</>
          )}
        </button>

        {!location && (
          <p className="cta-hint warning">↑ Välj en plats på kartan först</p>
        )}

        <p className="cta-hint">
          Vi analyserar platsen och skapar en AI-bild (~30 sek)
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card loading-state">
          <div className="loading-spinner" />
          <div className="loading-steps">
            <div className="loading-step completed">✓ Analyserar din plats</div>
            <div className="loading-step active">⏳ Beräknar historiska förändringar</div>
            <div className="loading-step">○ Genererar AI-bild</div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="result-section">
          <div className="card">
            <div className="result-header">
              <h2>Din tidsresa är klar!</h2>
              <span className="period-badge">{result.period} • {result.yearRange}</span>
            </div>

            {/* Image Comparison */}
            <div className="image-comparison">
              {image && (
                <div className="comparison-card">
                  <img src={image} alt="Idag" />
                  <div className="label">Idag</div>
                </div>
              )}
              {(result.generatedImageUrl || result.generatedImageBase64) && (
                <div className="comparison-card">
                  <img
                    src={result.generatedImageUrl || `data:image/png;base64,${result.generatedImageBase64}`}
                    alt={result.period}
                  />
                  <div className="label">{result.period}</div>
                </div>
              )}
            </div>

            {result.imageGenerationError && (
              <div className="error-message" style={{ marginBottom: '24px' }}>
                <p>Kunde inte generera bild: {result.imageGenerationError}</p>
              </div>
            )}

            {/* Location Info */}
            <p style={{ textAlign: 'center', marginBottom: '32px' }}>
              {result.locationDescription}
            </p>

            {/* Geological Data */}
            {result.geologicalData && (
              <div className="info-grid">
                <div className="info-card">
                  <div className="label">Höjd idag</div>
                  <div className="value">{result.geologicalData.currentElevation} m</div>
                </div>
                <div className="info-card">
                  <div className="label">Landhöjning</div>
                  <div className="value">+{result.geologicalData.totalUplift} m</div>
                </div>
                <div className="info-card">
                  <div className="label">Havsfas</div>
                  <div className="value" style={{ fontSize: '1rem' }}>{result.geologicalData.seaPhase.name}</div>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="details-section">
              <h3 style={{ marginBottom: '16px' }}>Så såg det ut</h3>
              <div className="details-grid">
                <div className="detail-card">
                  <h4>Landskap</h4>
                  <p>{result.historicalContext.landscape}</p>
                </div>
                <div className="detail-card">
                  <h4>Djurliv</h4>
                  <p>{result.historicalContext.fauna}</p>
                </div>
                <div className="detail-card">
                  <h4>Människor</h4>
                  <p>{result.historicalContext.people}</p>
                </div>
                <div className="detail-card">
                  <h4>Byggnader</h4>
                  <p>{result.historicalContext.buildings}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <p>Geologisk data från SGU • AI-bilder via Google Gemini</p>
      </footer>
    </main>
  )
}
