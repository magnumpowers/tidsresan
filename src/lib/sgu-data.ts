/**
 * SGU-inspirerad geologisk dataservice
 * Beräknar historiska landskap baserat på:
 * - Landhöjning (isostasi)
 * - Historiska havsnivåer (Östersjöns utveckling)
 * - Nuvarande elevation
 *
 * Baserat på SGU:s strandförskjutningsmodell och geologisk forskning
 */

// Landhöjningskurvor för olika regioner i Sverige (mm/år, nuvarande hastighet)
// Källa: Lantmäteriet & SGU
const LAND_UPLIFT_RATES: Record<string, number> = {
  'höga_kusten': 8.5,      // Höga kusten - snabbast i världen
  'norrland_kust': 7.5,
  'norrland_inland': 8.0,
  'svealand_kust': 5.0,
  'stockholm': 4.5,
  'gotland': 2.0,
  'götaland_väst': 3.0,
  'götaland_öst': 2.5,
  'skåne': 0.5,            // Nästan ingen landhöjning
  'danmark': 0.0,
}

// Östersjöns utvecklingsfaser och havsnivåer relativt idag
// Källa: Geologisk forskning, SGU
interface SeaPhase {
  name: string
  startYear: number  // År före nutid (BP = Before Present)
  endYear: number
  seaLevel: number   // Meter relativt dagens havsnivå i södra Östersjön
  salinity: 'freshwater' | 'brackish' | 'marine'
  description: string
}

const BALTIC_SEA_PHASES: SeaPhase[] = [
  {
    name: 'Baltiska issjön',
    startYear: 14000,
    endYear: 11700,
    seaLevel: 25,  // Dämdes upp av isen, hög nivå
    salinity: 'freshwater',
    description: 'Sötvattenssjö dämmd av inlandsisen'
  },
  {
    name: 'Yoldiahavet',
    startYear: 11700,
    endYear: 10700,
    seaLevel: -25,  // Snabb avtappning
    salinity: 'brackish',
    description: 'Bräckt hav med förbindelse till Atlanten via Mellansverige'
  },
  {
    name: 'Ancylussjön',
    startYear: 10700,
    endYear: 9000,
    seaLevel: -10,
    salinity: 'freshwater',
    description: 'Stor sötvattensjö utan havsförbindelse'
  },
  {
    name: 'Littorinahavet (tidig)',
    startYear: 9000,
    endYear: 6000,
    seaLevel: 5,  // Transgression - havet stiger
    salinity: 'marine',
    description: 'Salt hav, havsytan stiger, varmt klimat'
  },
  {
    name: 'Littorinahavet (sen)',
    startYear: 6000,
    endYear: 4000,
    seaLevel: 3,
    salinity: 'marine',
    description: 'Högsta havsnivån, varm period'
  },
  {
    name: 'Postlittorina/Östersjön',
    startYear: 4000,
    endYear: 0,
    seaLevel: 0,
    salinity: 'brackish',
    description: 'Gradvis övergång till dagens bräckta Östersjö'
  }
]

// Historiska tidsperioder för stenåldern
export interface StonePeriod {
  id: string
  name: string
  yearsBP: number  // År före nutid (medelvärde)
  yearRange: string
  culture: string
}

export const STONE_AGE_PERIODS: StonePeriod[] = [
  { id: 'late_glacial', name: 'Senglacial tid', yearsBP: 12000, yearRange: '14000-11700 BP', culture: 'Hamburgkulturen' },
  { id: 'preboreal', name: 'Preboreal', yearsBP: 10500, yearRange: '11700-10200 BP', culture: 'Maglemosekulturen' },
  { id: 'boreal', name: 'Boreal', yearsBP: 9000, yearRange: '10200-8000 BP', culture: 'Maglemosekulturen' },
  { id: 'atlantic_early', name: 'Äldre Atlantikum', yearsBP: 7000, yearRange: '8000-6000 BP', culture: 'Kongemosekulturen' },
  { id: 'atlantic_late', name: 'Yngre Atlantikum', yearsBP: 5500, yearRange: '6000-5000 BP', culture: 'Ertebøllekulturen' },
  { id: 'subboreal', name: 'Subboreal (Neolitikum)', yearsBP: 4000, yearRange: '5000-2500 BP', culture: 'Trattbägarkulturen' },
]

/**
 * Beräkna vilken region en koordinat tillhör för landhöjning
 */
export function getUpliftRegion(lat: number, lng: number): string {
  // Höga kusten
  if (lat >= 62.5 && lat <= 63.5 && lng >= 17 && lng <= 19) return 'höga_kusten'

  // Norrland
  if (lat > 63) {
    return lng < 16 ? 'norrland_inland' : 'norrland_kust'
  }
  if (lat > 60 && lat <= 63) {
    return lng > 17 ? 'norrland_kust' : 'svealand_kust'
  }

  // Svealand
  if (lat > 58.5 && lat <= 60) {
    if (lng > 17 && lng < 19.5) return 'stockholm'
    return 'svealand_kust'
  }

  // Gotland
  if (lat > 56.9 && lat < 58 && lng > 18 && lng < 19.5) return 'gotland'

  // Götaland
  if (lat > 56 && lat <= 58.5) {
    return lng < 14 ? 'götaland_väst' : 'götaland_öst'
  }

  // Skåne
  if (lat <= 56 && lat > 55.3) return 'skåne'

  // Danmark
  if (lat <= 55.3 || lng < 11) return 'danmark'

  return 'svealand_kust'
}

/**
 * Beräkna total landhöjning sedan en given tidpunkt
 * Landhöjningen var snabbare direkt efter istiden
 */
export function calculateTotalUplift(lat: number, lng: number, yearsBP: number): number {
  const region = getUpliftRegion(lat, lng)
  const currentRate = LAND_UPLIFT_RATES[region] || 3.0

  // Landhöjningen var exponentiellt snabbare efter istiden
  // Använder förenklad modell baserad på geologisk data
  let totalUplift = 0

  if (yearsBP > 10000) {
    // Snabb fas direkt efter istiden (10-15x snabbare)
    const fastYears = Math.min(yearsBP - 10000, 4000)
    totalUplift += fastYears * currentRate * 12 / 1000
    yearsBP = 10000
  }

  if (yearsBP > 5000) {
    // Mellenfas (3-5x snabbare)
    const mediumYears = Math.min(yearsBP - 5000, 5000)
    totalUplift += mediumYears * currentRate * 4 / 1000
    yearsBP = 5000
  }

  // Långsam fas (nuvarande hastighet)
  totalUplift += yearsBP * currentRate / 1000

  return Math.round(totalUplift)
}

/**
 * Hämta havsfas för en given tidpunkt
 */
export function getSeaPhase(yearsBP: number): SeaPhase {
  for (const phase of BALTIC_SEA_PHASES) {
    if (yearsBP >= phase.endYear && yearsBP < phase.startYear) {
      return phase
    }
  }
  return BALTIC_SEA_PHASES[BALTIC_SEA_PHASES.length - 1]
}

/**
 * Beräkna om en plats var under vatten vid en given tidpunkt
 */
export function calculateHistoricalSeaStatus(
  currentElevation: number,
  lat: number,
  lng: number,
  yearsBP: number
): {
  wasUnderwater: boolean
  historicalElevation: number
  seaLevel: number
  seaPhase: SeaPhase
  uplift: number
  description: string
} {
  const uplift = calculateTotalUplift(lat, lng, yearsBP)
  const seaPhase = getSeaPhase(yearsBP)

  // Historisk elevation = nuvarande elevation minus landhöjning sedan dess
  const historicalElevation = currentElevation - uplift

  // Var platsen under havsytan?
  const wasUnderwater = historicalElevation < seaPhase.seaLevel

  let description = ''
  if (wasUnderwater) {
    const depth = seaPhase.seaLevel - historicalElevation
    description = `Denna plats låg ${Math.round(depth)} meter under ${seaPhase.name}s yta. `
    description += seaPhase.description + '. '
    if (seaPhase.salinity === 'freshwater') {
      description += 'Vattnet var sött.'
    } else if (seaPhase.salinity === 'brackish') {
      description += 'Vattnet var bräckt.'
    } else {
      description += 'Vattnet var salt, liknande Nordsjön.'
    }
  } else {
    description = `Denna plats var land, ${Math.round(historicalElevation - seaPhase.seaLevel)} meter över ${seaPhase.name}s yta. `
    description += `Sedan dess har marken höjts cirka ${uplift} meter på grund av landhöjning efter istiden.`
  }

  return {
    wasUnderwater,
    historicalElevation,
    seaLevel: seaPhase.seaLevel,
    seaPhase,
    uplift,
    description
  }
}

/**
 * Hämta elevation från Open-Elevation API
 */
export async function fetchElevation(lat: number, lng: number): Promise<number> {
  try {
    // Använd Open-Elevation API (gratis, ingen nyckel krävs)
    const response = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
    )

    if (response.ok) {
      const data = await response.json()
      return data.results?.[0]?.elevation || 0
    }
  } catch (error) {
    console.error('Elevation API error:', error)
  }

  // Fallback: uppskatta baserat på region
  return estimateElevation(lat, lng)
}

/**
 * Uppskatta elevation baserat på region (fallback)
 */
function estimateElevation(lat: number, lng: number): number {
  const region = getUpliftRegion(lat, lng)

  const elevationEstimates: Record<string, number> = {
    'höga_kusten': 50,
    'norrland_kust': 30,
    'norrland_inland': 300,
    'svealand_kust': 20,
    'stockholm': 15,
    'gotland': 30,
    'götaland_väst': 50,
    'götaland_öst': 100,
    'skåne': 50,
    'danmark': 20,
  }

  return elevationEstimates[region] || 50
}

/**
 * Generera komplett geologisk analys för en plats och tidsperiod
 */
export async function analyzeLocation(
  lat: number,
  lng: number,
  periodId: string
): Promise<{
  period: StonePeriod
  elevation: number
  region: string
  seaStatus: ReturnType<typeof calculateHistoricalSeaStatus>
  landscape: string
  vegetation: string
  fauna: string
}> {
  const period = STONE_AGE_PERIODS.find(p => p.id === periodId) || STONE_AGE_PERIODS[3]
  const elevation = await fetchElevation(lat, lng)
  const region = getUpliftRegion(lat, lng)
  const seaStatus = calculateHistoricalSeaStatus(elevation, lat, lng, period.yearsBP)

  // Generera landskapsbeskrivning baserat på status
  let landscape = ''
  let vegetation = ''
  let fauna = ''

  if (seaStatus.wasUnderwater) {
    landscape = `Havsbotten under ${seaStatus.seaPhase.name}`
    vegetation = seaStatus.seaPhase.salinity === 'freshwater'
      ? 'Alger, vass vid stränder'
      : 'Marina alger, tång'
    fauna = seaStatus.seaPhase.salinity === 'freshwater'
      ? 'Sötvattensfisk, säl (vid kuster)'
      : 'Torsk, sill, säl, tumlare'
  } else {
    // Landbaserat - beror på period och region
    if (period.yearsBP > 10000) {
      landscape = 'Tundra och glaciärnära landskap, permafrost'
      vegetation = 'Lavar, mossor, dvärgbjörk, vide'
      fauna = 'Ren, fjällräv, lämmel, mammut (utdöende)'
    } else if (period.yearsBP > 8000) {
      landscape = 'Öppen björkskog, många sjöar från smältvatten'
      vegetation = 'Björk, tall börjar etableras, vide'
      fauna = 'Älg, ren, bäver, varg, björn'
    } else if (period.yearsBP > 5000) {
      landscape = 'Tät lövskog, klimatoptimum (2-3°C varmare)'
      vegetation = 'Ek, alm, lind, ask, hassel'
      fauna = 'Kronhjort, vildsvin, uroxe, älg, säl vid kust'
    } else {
      landscape = 'Öppnare landskap, tidigt jordbruk'
      vegetation = 'Blandskog, betesmarker, tidiga åkrar'
      fauna = 'Tamboskap, kronhjort, vildsvin, häst (tam)'
    }

    // Justera för region
    if (region.includes('norrland') || region === 'höga_kusten') {
      vegetation = vegetation.replace('Ek, alm, lind', 'Tall, gran, björk')
      fauna = fauna.replace('uroxe', 'ren')
    }
  }

  return {
    period,
    elevation,
    region,
    seaStatus,
    landscape,
    vegetation,
    fauna
  }
}
