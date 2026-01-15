// Historisk data för Skandinavien under stenåldern
// Baserat på geologisk och arkeologisk forskning

export interface HistoricalContext {
  period: string
  yearRange: string
  seaLevelDiff: number // meter relativt idag (negativt = lägre)
  landUplift: number // meter landhöjning sedan dess
  climate: string
  vegetation: string
  fauna: string
  humanActivity: string
  landscapeDescription: string
}

export interface LocationData {
  latitude: number
  longitude: number
  placeName?: string
  region: string
  distanceToCoast: number // km till närmaste kust idag
  elevation: number // meter över havet
}

// Stenålderns perioder i Skandinavien
export const STONE_AGE_PERIODS: Record<string, HistoricalContext> = {
  'senglacial': {
    period: 'Senglacial tid',
    yearRange: '12000-9700 f.Kr.',
    seaLevelDiff: -50,
    landUplift: 200,
    climate: 'Arktiskt, tundraklimat med korta somrar',
    vegetation: 'Tundra med lavar, mossor, dvärgbjörk och vide',
    fauna: 'Ren, fjällräv, lämmel, snöuggla, mammut (utdöende)',
    humanActivity: 'Få eller inga människor, de första jägarna börjar anlända',
    landscapeDescription: 'Öppet tundralandskap med permafrost, stora issjöar, inlandsisen drar sig tillbaka'
  },
  'preboreal': {
    period: 'Preboreal tid (Äldre stenåldern)',
    yearRange: '9700-8900 f.Kr.',
    seaLevelDiff: -40,
    landUplift: 150,
    climate: 'Subarktiskt, varmare än idag på somrarna',
    vegetation: 'Björkskog börjar sprida sig, tundra i norr',
    fauna: 'Ren, älg, bäver, varg, björn, havsfåglar',
    humanActivity: 'Maglemosekulturen - jägare och samlare längs kuster och vattendrag',
    landscapeDescription: 'Björkskogar etableras, många sjöar från smältvatten, Östersjön är en sötvattenssjö (Ancylussjön)'
  },
  'boreal': {
    period: 'Boreal tid',
    yearRange: '8900-7500 f.Kr.',
    seaLevelDiff: -25,
    landUplift: 100,
    climate: 'Tempererat, torrare än idag',
    vegetation: 'Tallskog dominerar, hassel börjar komma',
    fauna: 'Älg, kronhjort, vildsvin, uroxe, bäver',
    humanActivity: 'Kongemosekulturen - säsongsläger, fiske, jakt på sjödäggdjur',
    landscapeDescription: 'Täta tallskogar, mindre sjöar, kustlinjen förändras snabbt på grund av landhöjning'
  },
  'atlantisk': {
    period: 'Atlantisk tid (Mellanneolitikum)',
    yearRange: '7500-3800 f.Kr.',
    seaLevelDiff: +3,
    landUplift: 50,
    climate: 'Varmt och fuktigt, 2-3°C varmare än idag',
    vegetation: 'Lövskog med ek, alm, lind, ask - "klimatoptimum"',
    fauna: 'Kronhjort, vildsvin, uroxe, älg, säl, tumlare',
    humanActivity: 'Ertebøllekulturen - bofast vid kusten, skalbankar, de första jordbrukarna kommer',
    landscapeDescription: 'Täta lövskogar, havet står som högst (Littorinahavet), många öar som idag är fastland'
  },
  'subboreal': {
    period: 'Subboreal tid (Senneolitikum)',
    yearRange: '3800-500 f.Kr.',
    seaLevelDiff: 0,
    landUplift: 20,
    climate: 'Svalare och torrare än atlantisk tid',
    vegetation: 'Öppen betesmark, boken kommer, jordbrukslandskap',
    fauna: 'Tamboskap, kronhjort, vildsvin (minskande), häst',
    humanActivity: 'Trattbägarkultur, gånggrifter, megalitgravar, jordbruk etablerat',
    landscapeDescription: 'Öppnare landskap, de första åkrarna, betesmarker, bosättningar med långhus'
  }
}

// Beräkna region baserat på koordinater
export function getRegion(lat: number, lng: number): string {
  // Förenklad regionindelning för Sverige
  if (lat > 66.5) return 'Lappland'
  if (lat > 63) return 'Norrland'
  if (lat > 60) return 'Svealand'
  if (lat > 58) return 'Götaland'
  if (lat > 55) return 'Skåne/Södra Sverige'

  // Danmark
  if (lat > 54 && lng > 8 && lng < 16) return 'Danmark'

  // Norge
  if (lng < 8) return 'Norge'

  return 'Skandinavien'
}

// Beräkna approximativ höjd över havet (förenklad)
export async function getElevation(lat: number, lng: number): Promise<number> {
  // I en riktig app skulle vi använda ett elevations-API
  // För nu returnerar vi ett uppskattat värde baserat på region
  const region = getRegion(lat, lng)

  if (region === 'Lappland') return 500
  if (region === 'Norrland') return 200
  if (region === 'Svealand') return 50
  if (region === 'Götaland') return 100
  if (region === 'Skåne/Södra Sverige') return 50
  return 100
}

// Generera historisk kontext baserat på plats och period
export function generateHistoricalContext(
  lat: number,
  lng: number,
  period: keyof typeof STONE_AGE_PERIODS = 'atlantisk'
): { context: HistoricalContext; locationAnalysis: string } {
  const context = STONE_AGE_PERIODS[period]
  const region = getRegion(lat, lng)

  // Beräkna hur platsen påverkades av landhöjning och havsnivå
  let locationAnalysis = ''

  // Landhöjning är störst i norra Sverige/Finland
  const upliftFactor = lat > 60 ? 1.5 : lat > 55 ? 1.0 : 0.5
  const actualUplift = Math.round(context.landUplift * upliftFactor)

  // Var platsen under vatten?
  const estimatedElevation = lat > 60 ? 50 : 30 // Förenklad uppskattning
  const historicalElevation = estimatedElevation - actualUplift

  if (historicalElevation < context.seaLevelDiff) {
    locationAnalysis = `Under ${context.period.toLowerCase()} låg denna plats troligen under vatten. `
    locationAnalysis += `Landhöjningen i ${region} har varit cirka ${actualUplift} meter sedan dess. `
    locationAnalysis += `Kustlinjen låg långt inåt land jämfört med idag.`
  } else {
    locationAnalysis = `Under ${context.period.toLowerCase()} var detta område land. `

    if (region === 'Lappland' || region === 'Norrland') {
      if (period === 'senglacial' || period === 'preboreal') {
        locationAnalysis += `Inlandsisen täckte fortfarande delar av området eller hade nyligen smält. `
        locationAnalysis += `Landskapet präglades av smältvattenströmmar och issjöar.`
      } else {
        locationAnalysis += `Tajgan dominerade med tall och björk. `
        locationAnalysis += `Renjakt var viktig för de få människor som bodde här.`
      }
    } else {
      locationAnalysis += context.landscapeDescription + ' '
      locationAnalysis += `${context.humanActivity}`
    }
  }

  return { context, locationAnalysis }
}

// Generera en bildprompt baserat på historisk data
export function generateImagePrompt(
  lat: number,
  lng: number,
  period: keyof typeof STONE_AGE_PERIODS = 'atlantisk',
  currentViewDescription?: string
): string {
  const { context, locationAnalysis } = generateHistoricalContext(lat, lng, period)
  const region = getRegion(lat, lng)

  let prompt = `A photorealistic landscape painting of ${region}, Scandinavia during the ${context.period} (${context.yearRange}). `

  // Lägg till landskapsbeskrivning
  prompt += `${context.landscapeDescription}. `
  prompt += `Vegetation: ${context.vegetation}. `
  prompt += `Wildlife visible: ${context.fauna}. `

  // Klimat och atmosfär
  prompt += `The climate is ${context.climate}. `

  // Om vi har en beskrivning av nuvarande vy, använd den för komposition
  if (currentViewDescription) {
    prompt += `The composition shows a similar viewpoint to: ${currentViewDescription}, but transformed to show how it looked in prehistoric times. `
  }

  // Lägg till människor om relevant
  if (context.humanActivity && !context.humanActivity.includes('inga människor')) {
    prompt += `In the distance, signs of ${context.humanActivity.toLowerCase()} might be visible. `
  }

  // Stil och kvalitet
  prompt += `Highly detailed, natural lighting, National Geographic style photography, 8K resolution, atmospheric perspective.`

  return prompt
}

// Omvänd geokodning för att få platsnamn (förenklad version)
export function getApproximateLocation(lat: number, lng: number): string {
  const region = getRegion(lat, lng)

  // Några kända platser
  if (lat > 59.3 && lat < 59.4 && lng > 17.9 && lng < 18.2) return 'Stockholm'
  if (lat > 57.6 && lat < 57.8 && lng > 11.9 && lng < 12.1) return 'Göteborg'
  if (lat > 55.5 && lat < 55.7 && lng > 12.9 && lng < 13.1) return 'Malmö'
  if (lat > 59.8 && lat < 60.0 && lng > 17.5 && lng < 17.8) return 'Uppsala'
  if (lat > 55.6 && lat < 55.8 && lng > 12.5 && lng < 12.7) return 'Köpenhamn'
  if (lat > 59.8 && lat < 60.0 && lng > 10.6 && lng < 10.9) return 'Oslo'

  return region
}
