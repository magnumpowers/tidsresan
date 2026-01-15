/**
 * Förenklade historiska kustlinjer för Skandinavien
 * Baserat på SGU:s strandförskjutningsmodell och geologisk forskning
 *
 * Dessa är approximationer för visualisering - inte exakta gränser
 */

// Områden som var under vatten under olika perioder
// Koordinater i [lat, lng] format för Leaflet polygoner

export interface CoastlineData {
  id: string
  name: string
  yearsBP: number
  seaName: string
  color: string
  opacity: number
  // Polygoner som visar ungefärliga havsområden (utöver dagens)
  // Dessa representerar landområden som VAR under vatten
  underwaterAreas: [number, number][][]
}

// Littorinahavet - högsta havsnivån (~7000-5000 BP)
// Havet stod ca 5-10m högre i södra Sverige, mycket högre i norr pga landhöjning
const LITTORINA_AREAS: [number, number][][] = [
  // Mälardalen var en havsvik
  [
    [59.8, 17.2], [59.7, 17.5], [59.5, 17.8], [59.3, 18.0],
    [59.2, 17.8], [59.1, 17.5], [59.0, 17.2], [59.1, 16.8],
    [59.2, 16.5], [59.4, 16.3], [59.6, 16.5], [59.7, 16.8], [59.8, 17.2]
  ],
  // Hjälmaren och Vänern var sammankopplade med havet
  [
    [59.2, 15.0], [59.1, 15.5], [59.0, 15.8], [58.8, 15.5],
    [58.7, 15.0], [58.8, 14.5], [59.0, 14.3], [59.2, 14.5], [59.2, 15.0]
  ],
  // Stockholmsområdet - större delar under vatten
  [
    [59.5, 18.2], [59.4, 18.5], [59.3, 18.7], [59.2, 18.5],
    [59.1, 18.2], [59.2, 17.9], [59.3, 17.8], [59.4, 17.9], [59.5, 18.2]
  ],
  // Uppland - stora delar under vatten
  [
    [60.2, 17.5], [60.1, 18.0], [60.0, 18.3], [59.8, 18.2],
    [59.7, 17.8], [59.8, 17.3], [60.0, 17.2], [60.2, 17.5]
  ],
]

// Ancylussjön (~10000-9000 BP) - sötvattensjö, lägre nivå men annorlunda utbredning
const ANCYLUS_AREAS: [number, number][][] = [
  // Mellansverige - Närke-sänkan var under vatten
  [
    [59.5, 14.5], [59.3, 15.0], [59.1, 15.3], [58.9, 15.0],
    [58.8, 14.5], [59.0, 14.0], [59.3, 13.8], [59.5, 14.2], [59.5, 14.5]
  ],
  // Östergötland låglänta områden
  [
    [58.6, 15.5], [58.5, 16.0], [58.3, 16.2], [58.2, 15.8],
    [58.3, 15.3], [58.5, 15.2], [58.6, 15.5]
  ],
]

// Yoldiahavet (~11500 BP) - havsförbindelse genom Mellansverige
const YOLDIA_AREAS: [number, number][][] = [
  // "Yoldia-sundet" genom Mellansverige
  [
    [59.0, 12.5], [59.2, 13.0], [59.3, 14.0], [59.2, 15.0],
    [59.0, 15.5], [58.8, 15.3], [58.6, 14.5], [58.7, 13.5],
    [58.8, 12.8], [59.0, 12.5]
  ],
  // Större områden i Svealand
  [
    [60.0, 16.0], [59.8, 17.0], [59.5, 17.5], [59.2, 17.3],
    [59.0, 16.5], [59.2, 15.8], [59.5, 15.5], [59.8, 15.8], [60.0, 16.0]
  ],
]

// Baltiska issjön (~13000 BP) - dämdes upp av isen
const BALTIC_ICE_LAKE_AREAS: [number, number][][] = [
  // Södra Sverige - stora områden under vatten
  [
    [56.5, 13.0], [56.8, 14.0], [57.0, 15.0], [56.8, 16.0],
    [56.5, 16.5], [56.0, 16.0], [55.8, 15.0], [56.0, 14.0], [56.5, 13.0]
  ],
  // Blekinge-Småland
  [
    [56.8, 14.5], [57.0, 15.5], [57.2, 16.0], [57.0, 16.5],
    [56.7, 16.2], [56.5, 15.5], [56.6, 14.8], [56.8, 14.5]
  ],
]

export const HISTORICAL_COASTLINES: CoastlineData[] = [
  {
    id: 'late_glacial',
    name: 'Senglacial tid',
    yearsBP: 12000,
    seaName: 'Baltiska issjön',
    color: '#1e3a5f',
    opacity: 0.4,
    underwaterAreas: BALTIC_ICE_LAKE_AREAS
  },
  {
    id: 'preboreal',
    name: 'Preboreal',
    yearsBP: 10500,
    seaName: 'Yoldiahavet',
    color: '#2e5a8f',
    opacity: 0.4,
    underwaterAreas: YOLDIA_AREAS
  },
  {
    id: 'boreal',
    name: 'Boreal',
    yearsBP: 9000,
    seaName: 'Ancylussjön',
    color: '#3e7abf',
    opacity: 0.4,
    underwaterAreas: ANCYLUS_AREAS
  },
  {
    id: 'atlantic_early',
    name: 'Äldre Atlantikum',
    yearsBP: 7000,
    seaName: 'Littorinahavet',
    color: '#0077be',
    opacity: 0.5,
    underwaterAreas: LITTORINA_AREAS
  },
  {
    id: 'atlantic_late',
    name: 'Yngre Atlantikum',
    yearsBP: 5500,
    seaName: 'Littorinahavet',
    color: '#0088cc',
    opacity: 0.45,
    underwaterAreas: LITTORINA_AREAS.map(poly =>
      poly.map(([lat, lng]) => [lat, lng] as [number, number])
    ) // Samma som tidig Littorina men något mindre
  },
  {
    id: 'subboreal',
    name: 'Subboreal',
    yearsBP: 4000,
    seaName: 'Sen Littorina/Östersjön',
    color: '#00aadd',
    opacity: 0.35,
    underwaterAreas: [] // Nästan som idag
  }
]

// Mappning från nya period-ID:n till geologiska perioder för kustlinjer
const PERIOD_TO_COASTLINE_MAP: Record<string, string> = {
  // Stenåldern
  'stone_early': 'boreal',        // 10000-4000 f.Kr -> Ancylussjön/Littorina
  'stone_middle': 'atlantic_early', // 4000-2500 f.Kr -> Littorinahavet
  'stone_late': 'atlantic_late',  // 2500-1700 f.Kr -> Sen Littorina

  // Bronsåldern och framåt - moderna kustlinjer
  'bronze': 'subboreal',
  'iron_early': 'subboreal',
  'iron_late': 'subboreal',
  'viking': 'subboreal',
  'medieval_early': 'subboreal',
  'medieval_late': 'subboreal',
  'early_modern': 'subboreal',
  'industrial': 'subboreal',
  'early_1900s': 'subboreal',

  // Originala period-ID:n (för bakåtkompatibilitet)
  'late_glacial': 'late_glacial',
  'preboreal': 'preboreal',
  'boreal': 'boreal',
  'atlantic_early': 'atlantic_early',
  'atlantic_late': 'atlantic_late',
  'subboreal': 'subboreal'
}

export function getCoastlineForPeriod(periodId: string): CoastlineData | undefined {
  const mappedId = PERIOD_TO_COASTLINE_MAP[periodId] || periodId
  return HISTORICAL_COASTLINES.find(c => c.id === mappedId)
}
