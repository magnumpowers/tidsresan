/**
 * Stadsdetektering för att avgöra om en plats är urban, kust eller landsbygd
 * Baserat på kända svenska städers historiska ursprung
 */

export interface CityInfo {
  name: string
  lat: number
  lng: number
  foundedYear: number  // Ungefärligt grundningsår (negativt = f.Kr)
  historicalType: 'ancient_settlement' | 'medieval_town' | 'early_modern' | 'industrial' | 'modern'
  population: number   // Ungefärlig nuvarande befolkning
}

// Svenska städer med historiska data
export const SWEDISH_CITIES: CityInfo[] = [
  // Stora städer
  { name: 'Stockholm', lat: 59.3293, lng: 18.0686, foundedYear: 1252, historicalType: 'medieval_town', population: 1000000 },
  { name: 'Göteborg', lat: 57.7089, lng: 11.9746, foundedYear: 1621, historicalType: 'early_modern', population: 580000 },
  { name: 'Malmö', lat: 55.6050, lng: 13.0038, foundedYear: 1275, historicalType: 'medieval_town', population: 350000 },
  { name: 'Uppsala', lat: 59.8586, lng: 17.6389, foundedYear: 1164, historicalType: 'medieval_town', population: 170000 },
  { name: 'Linköping', lat: 58.4108, lng: 15.6214, foundedYear: 1287, historicalType: 'medieval_town', population: 160000 },
  { name: 'Västerås', lat: 59.6099, lng: 16.5448, foundedYear: 1000, historicalType: 'ancient_settlement', population: 155000 },
  { name: 'Örebro', lat: 59.2753, lng: 15.2134, foundedYear: 1200, historicalType: 'medieval_town', population: 150000 },
  { name: 'Norrköping', lat: 58.5877, lng: 16.1924, foundedYear: 1350, historicalType: 'medieval_town', population: 140000 },
  { name: 'Helsingborg', lat: 56.0465, lng: 12.6945, foundedYear: 1085, historicalType: 'medieval_town', population: 145000 },
  { name: 'Jönköping', lat: 57.7826, lng: 14.1618, foundedYear: 1284, historicalType: 'medieval_town', population: 140000 },

  // Medelstora städer
  { name: 'Lund', lat: 55.7047, lng: 13.1910, foundedYear: 990, historicalType: 'ancient_settlement', population: 125000 },
  { name: 'Umeå', lat: 63.8258, lng: 20.2630, foundedYear: 1622, historicalType: 'early_modern', population: 130000 },
  { name: 'Gävle', lat: 60.6749, lng: 17.1413, foundedYear: 1446, historicalType: 'medieval_town', population: 100000 },
  { name: 'Borås', lat: 57.7210, lng: 12.9401, foundedYear: 1621, historicalType: 'early_modern', population: 110000 },
  { name: 'Sundsvall', lat: 62.3908, lng: 17.3069, foundedYear: 1621, historicalType: 'early_modern', population: 100000 },
  { name: 'Eskilstuna', lat: 59.3666, lng: 16.5077, foundedYear: 1659, historicalType: 'early_modern', population: 105000 },
  { name: 'Karlstad', lat: 59.4022, lng: 13.5115, foundedYear: 1584, historicalType: 'early_modern', population: 95000 },
  { name: 'Växjö', lat: 56.8777, lng: 14.8091, foundedYear: 1342, historicalType: 'medieval_town', population: 95000 },
  { name: 'Halmstad', lat: 56.6745, lng: 12.8578, foundedYear: 1307, historicalType: 'medieval_town', population: 100000 },
  { name: 'Luleå', lat: 65.5848, lng: 22.1547, foundedYear: 1621, historicalType: 'early_modern', population: 80000 },

  // Historiskt viktiga platser (förhistoriska/vikingatida)
  { name: 'Gamla Uppsala', lat: 59.8979, lng: 17.6330, foundedYear: -500, historicalType: 'ancient_settlement', population: 5000 },
  { name: 'Birka', lat: 59.3333, lng: 17.5500, foundedYear: 750, historicalType: 'ancient_settlement', population: 100 },
  { name: 'Sigtuna', lat: 59.6178, lng: 17.7256, foundedYear: 970, historicalType: 'ancient_settlement', population: 10000 },
  { name: 'Visby', lat: 57.6348, lng: 18.2948, foundedYear: 900, historicalType: 'ancient_settlement', population: 25000 },
  { name: 'Kalmar', lat: 56.6634, lng: 16.3566, foundedYear: 1100, historicalType: 'medieval_town', population: 70000 },
  { name: 'Skara', lat: 58.3864, lng: 13.4384, foundedYear: 1000, historicalType: 'ancient_settlement', population: 20000 },
  { name: 'Falun', lat: 60.6065, lng: 15.6355, foundedYear: 1641, historicalType: 'early_modern', population: 60000 },

  // Kuststäder
  { name: 'Ystad', lat: 55.4295, lng: 13.8200, foundedYear: 1244, historicalType: 'medieval_town', population: 30000 },
  { name: 'Trelleborg', lat: 55.3758, lng: 13.1566, foundedYear: 1257, historicalType: 'medieval_town', population: 45000 },
  { name: 'Varberg', lat: 57.1057, lng: 12.2508, foundedYear: 1300, historicalType: 'medieval_town', population: 35000 },
  { name: 'Karlskrona', lat: 56.1612, lng: 15.5869, foundedYear: 1680, historicalType: 'early_modern', population: 65000 },
  { name: 'Hudiksvall', lat: 61.7271, lng: 17.1053, foundedYear: 1582, historicalType: 'early_modern', population: 40000 },
]

export type LocationType = 'urban' | 'coastal' | 'rural'

export interface LocationAnalysis {
  type: LocationType
  nearestCity: CityInfo | null
  distanceToCity: number  // km
  cityExistedInPeriod: boolean
  historicalDescription: string
}

/**
 * Beräkna avstånd mellan två koordinater (Haversine-formel)
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Jordens radie i km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Kolla om platsen är nära kusten baserat på enkel heuristik
 */
function isNearCoast(lat: number, lng: number): boolean {
  // Enkel heuristik för svensk kust
  // Västkusten: lng < 12.5 och lat mellan 55.5 och 59
  if (lng < 12.5 && lat >= 55.5 && lat <= 59) return true

  // Östkusten: Östersjön
  // Skåne syd/ost
  if (lat < 56.5 && lng > 13.5 && lng < 15) return true
  // Blekinge/Kalmar
  if (lat >= 55.5 && lat < 58 && lng > 15 && lng < 17) return true
  // Stockholm skärgård
  if (lat >= 58.5 && lat < 60.5 && lng > 18) return true
  // Norrlandskusten
  if (lat >= 60 && lng > 17 && lng < 24) return true

  // Gotland
  if (lat >= 56.9 && lat <= 58.4 && lng >= 18 && lng <= 19.5) return true

  return false
}

/**
 * Analysera en plats och avgör om den är urban, kust eller landsbygd
 */
export function analyzeLocationType(
  lat: number,
  lng: number,
  yearStart: number  // År (negativt = f.Kr, positivt = e.Kr)
): LocationAnalysis {
  // Hitta närmaste stad
  let nearestCity: CityInfo | null = null
  let minDistance = Infinity

  for (const city of SWEDISH_CITIES) {
    const distance = haversineDistance(lat, lng, city.lat, city.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearestCity = city
    }
  }

  // Avgör om staden existerade under perioden
  const cityExistedInPeriod = nearestCity ? nearestCity.foundedYear <= yearStart : false

  // Avgör platstyp
  let type: LocationType = 'rural'
  let historicalDescription = ''

  // Urban: inom 5km från en stad som existerade under perioden
  // Eller inom 2km från en stad som existerar nu (för förhistoriska perioder visar vi "här kommer staden X att ligga")
  const urbanThreshold = cityExistedInPeriod ? 5 : 2

  if (nearestCity && minDistance < urbanThreshold) {
    if (cityExistedInPeriod) {
      type = 'urban'
      if (nearestCity.historicalType === 'ancient_settlement') {
        historicalDescription = `Du befinner dig vid ${nearestCity.name}, en av Skandinaviens äldsta bosättningar.`
      } else if (nearestCity.historicalType === 'medieval_town') {
        historicalDescription = `Du befinner dig i ${nearestCity.name}, en medeltida handelsstad.`
      } else {
        historicalDescription = `Du befinner dig i ${nearestCity.name}.`
      }
    } else {
      // Staden finns inte än - visa vildmark men nämn framtiden
      if (yearStart < -4000) {
        historicalDescription = `Här, där ${nearestCity.name} en dag kommer att grundas (${nearestCity.foundedYear} e.Kr.), finns nu endast vildmark.`
      } else if (yearStart < nearestCity.foundedYear) {
        historicalDescription = `Denna plats kommer senare att bli ${nearestCity.name} (grundat ${nearestCity.foundedYear} e.Kr.), men nu är det ${
          isNearCoast(lat, lng) ? 'en kustremsa med fiskelägen' : 'glest befolkad bygd'
        }.`
      }
    }
  } else if (isNearCoast(lat, lng)) {
    type = 'coastal'
    if (yearStart < -8000) {
      historicalDescription = 'Du befinner dig vid den forna Östersjökusten, där jägare-samlare fiskar och jagar säl.'
    } else if (yearStart < -4000) {
      historicalDescription = 'Kusten här är rik på fisk och säl. Stenåldersmänniskor har lägerplatser längs stranden.'
    } else if (yearStart < 800) {
      historicalDescription = 'Ett kustsamhälle med fiskare och handelsmän. Båtar syns i viken.'
    } else {
      historicalDescription = 'En livlig kust med handel och fiske.'
    }
  } else {
    type = 'rural'
    if (yearStart < -4000) {
      historicalDescription = 'Vild urskog så långt ögat når. Jägare och samlare rör sig genom landskapet.'
    } else if (yearStart < -1700) {
      historicalDescription = 'Jordbruksbygd med små gårdar och betesmark. Röjda gläntor i skogen.'
    } else if (yearStart < 800) {
      historicalDescription = 'Jordbrukslandskap med byar och gårdar. Gravhögar syns på kullarna.'
    } else {
      historicalDescription = 'Landsbygd med byar, gårdar och kyrkor.'
    }
  }

  return {
    type,
    nearestCity,
    distanceToCity: Math.round(minDistance * 10) / 10,
    cityExistedInPeriod,
    historicalDescription
  }
}

/**
 * Få stadsspecifik beskrivning för en tidsperiod
 */
export function getCityDescription(city: CityInfo, yearStart: number): string {
  if (yearStart < city.foundedYear) {
    return `${city.name} existerar inte än - grundas ${city.foundedYear} e.Kr.`
  }

  // Specifika beskrivningar för kända städer
  const cityDescriptions: Record<string, Record<string, string>> = {
    'Stockholm': {
      'medieval': 'Stockholms gamla stad med trähus, kyrkor och smala gränder. Handel vid Stortorget.',
      'early_modern': 'Stormaktstidens Stockholm med slottet under byggnad, Tyska kyrkan och livlig hamn.',
      'industrial': 'Stockholms stenstad växer. Ångslupar på Strömmen, gas­lyktor längs gatorna.',
      'modern': 'Modern storstad med spårvagnar, bilar och höga stenhus.'
    },
    'Göteborg': {
      'early_modern': 'Den nygrundade fästningsstaden Göteborg med vallar, kanaler och holländska köpmän.',
      'industrial': 'Göteborgs hamn full av segelfartyg. Arbetarbostäder växer upp kring fabrikerna.',
      'modern': 'Industristad med varv, hamnar och Liseberg.'
    },
    'Uppsala': {
      'medieval': 'Uppsala domkyrka reser sig över staden. Präster, studenter och pilgrimer i gatorna.',
      'early_modern': 'Universitetsstad med studentnationer och bokhandlar.',
      'industrial': 'Universitetsstaden Uppsala med järnvägsstation och växande förort.',
      'modern': 'Modern universitetsstad med cykelvägar och forskningscentra.'
    },
    'Visby': {
      'medieval': 'Hansastaden Visby i sin glans. Köpmän från hela Östersjön, ringmur under byggnad.',
      'early_modern': 'Visby efter Hansans fall - en mindre lantstad inom de mäktiga murarna.',
      'industrial': 'Visby som badort och turistmål. Ruiner från storhetstiden.',
      'modern': 'Världsarvsstad med välbevarad ringmur och sommargäster.'
    },
    'Birka': {
      'viking': 'Vikingatida handelsstad på Björkö. Köpmän, hantverkare, och skepp från fjärran länder.',
    },
    'Gamla Uppsala': {
      'prehistoric': 'De mäktiga kungshögarna. Hednatempel och blot till de gamla gudarna.',
      'viking': 'Svearikets religiösa centrum. Kungshögarna och det stora templet.',
      'medieval': 'Det gamla Uppsala - nu i skuggan av nya Uppsala. Kyrkan står på den forna kultplatsen.'
    },
    'Sigtuna': {
      'viking': 'Sveriges första stad. Kyrkor byggs, mynt präglas, kristendomen breder ut sig.',
      'medieval': 'Sigtuna som kungasäte och kyrkligt centrum. Kloster och stenkyrkor.'
    },
    'Lund': {
      'medieval': 'Ärkebiskopens stad. Domkyrkan, kloster och den nordiska kyrkans centrum.',
      'early_modern': 'Universitetet grundas. Studenter och professorer i de medeltida gatorna.',
      'modern': 'Modern universitetsstad med bevarat medeltida centrum.'
    }
  }

  const cityData = cityDescriptions[city.name]
  if (!cityData) {
    // Generisk beskrivning baserat på stadstyp
    if (yearStart >= 1900) return `${city.name} - en modern svensk stad.`
    if (yearStart >= 1800) return `${city.name} under industrialiseringen.`
    if (yearStart >= 1600) return `${city.name} under stormaktstiden.`
    if (yearStart >= 1000) return `Den medeltida staden ${city.name}.`
    return `${city.name} som tidig bosättning.`
  }

  // Hitta rätt period
  if (yearStart >= 1900 && cityData['modern']) return cityData['modern']
  if (yearStart >= 1800 && cityData['industrial']) return cityData['industrial']
  if (yearStart >= 1600 && cityData['early_modern']) return cityData['early_modern']
  if (yearStart >= 1000 && cityData['medieval']) return cityData['medieval']
  if (yearStart >= 800 && cityData['viking']) return cityData['viking']
  if (cityData['prehistoric']) return cityData['prehistoric']

  return `${city.name} under denna tidsperiod.`
}
