import { NextRequest, NextResponse } from 'next/server'
import {
  analyzeLocation,
  STONE_AGE_PERIODS,
  getUpliftRegion,
  calculateTotalUplift,
  getSeaPhase
} from '@/lib/sgu-data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const periodId = searchParams.get('period') || 'atlantic_early'

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'Latitude och longitude krävs' },
      { status: 400 }
    )
  }

  try {
    const analysis = await analyzeLocation(lat, lng, periodId)

    return NextResponse.json({
      success: true,
      coordinates: { lat, lng },
      ...analysis
    })
  } catch (error) {
    console.error('Geology API error:', error)
    return NextResponse.json(
      { error: 'Kunde inte analysera platsen' },
      { status: 500 }
    )
  }
}

// POST för batch-analys av flera tidsperioder
export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude och longitude krävs' },
        { status: 400 }
      )
    }

    // Analysera alla tidsperioder
    const analyses = await Promise.all(
      STONE_AGE_PERIODS.map(async (period) => {
        const analysis = await analyzeLocation(latitude, longitude, period.id)
        return {
          periodId: period.id,
          ...analysis
        }
      })
    )

    const region = getUpliftRegion(latitude, longitude)

    return NextResponse.json({
      success: true,
      coordinates: { lat: latitude, lng: longitude },
      region,
      periods: analyses
    })
  } catch (error) {
    console.error('Geology API error:', error)
    return NextResponse.json(
      { error: 'Kunde inte analysera platsen' },
      { status: 500 }
    )
  }
}
