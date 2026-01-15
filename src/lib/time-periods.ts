/**
 * Historiska tidsperioder för Sverige
 * Från istiden till modern tid
 */

export interface TimePeriod {
  id: string
  name: string
  era: 'prehistoric' | 'ancient' | 'medieval' | 'early_modern' | 'modern'
  yearStart: number  // Negativt = f.Kr, positivt = e.Kr
  yearEnd: number
  yearLabel: string
  description: string
  // Landskapsbeskrivningar
  landscape: {
    rural: string      // Landsbygd
    coastal: string    // Kust
    urban: string      // Stad (om relevant)
  }
  // Vad man kan förvänta sig se
  features: {
    buildings: string
    people: string
    animals: string
    vegetation: string
    technology: string
  }
  // Färg för UI
  color: string
}

export const TIME_PERIODS: TimePeriod[] = [
  // === STENÅLDERN ===
  {
    id: 'stone_early',
    name: 'Äldre stenåldern',
    era: 'prehistoric',
    yearStart: -10000,
    yearEnd: -4000,
    yearLabel: '10 000 - 4 000 f.Kr.',
    description: 'Jägare och samlare. Isen har nyligen smält. Människor lever i små grupper och följer viltet.',
    landscape: {
      rural: 'Vild urskog med tall och björk, sjöar och våtmarker, inga vägar eller byggnader',
      coastal: 'Klippiga stränder, sälkolonier, fiskare i enkla kanoter av trä',
      urban: 'Inga städer existerar - endast tillfälliga lägerplatser'
    },
    features: {
      buildings: 'Tillfälliga hyddor av skinn och grenar, vindskydd',
      people: 'Jägare klädda i djurhudar, små familjegrupper',
      animals: 'Älg, ren, vildsvin, säl, varg, björn',
      vegetation: 'Tall, björk, vide, bärbuskar, vass vid vatten',
      technology: 'Stenverktyg, pilbågar, fiskeredskap av ben'
    },
    color: '#8B4513'
  },
  {
    id: 'stone_middle',
    name: 'Mellanneolitikum',
    era: 'prehistoric',
    yearStart: -4000,
    yearEnd: -2500,
    yearLabel: '4 000 - 2 500 f.Kr.',
    description: 'De första bönderna. Jordbruk och boskapsskötsel börjar. Megalitgravar byggs.',
    landscape: {
      rural: 'Öppnare landskap, små åkrar, betesmarker, lövskog',
      coastal: 'Skalbankar vid kusten, fiskelägen, enkla båtar',
      urban: 'Inga städer - större byar med långhus'
    },
    features: {
      buildings: 'Långhus av trä och lera, megalitgravar (dösar, gånggrifter)',
      people: 'Bönder i enkla linnekläder, kvinnor med keramikkärl',
      animals: 'Tamboskap (kor, får, getter), hundar, vilda djur i skogen',
      vegetation: 'Odlade fält med korn, lövängar, ek och hassel',
      technology: 'Slipade stenyxor, keramik, enkla plogar'
    },
    color: '#A0522D'
  },
  {
    id: 'stone_late',
    name: 'Yngre stenåldern',
    era: 'prehistoric',
    yearStart: -2500,
    yearEnd: -1700,
    yearLabel: '2 500 - 1 700 f.Kr.',
    description: 'Stridsyxekulturen. Mer hierarkiska samhällen. Handel över stora avstånd.',
    landscape: {
      rural: 'Jordbrukslandskap med gårdar, gravhögar på kullar',
      coastal: 'Handelsplatser vid kusten, större båtar',
      urban: 'Inga städer - men större bosättningar'
    },
    features: {
      buildings: 'Större gårdar, hövdingahus, gravhögar',
      people: 'Hövdingar med stridsyxor, bondefamiljer, handelsmän',
      animals: 'Hästar börjar användas, kor, får, hundar',
      vegetation: 'Mer öppet odlingslandskap, ek och bok',
      technology: 'Stridsyxor, bättre keramik, begynnande metallkunskap'
    },
    color: '#CD853F'
  },

  // === BRONSÅLDERN ===
  {
    id: 'bronze',
    name: 'Bronsåldern',
    era: 'ancient',
    yearStart: -1700,
    yearEnd: -500,
    yearLabel: '1 700 - 500 f.Kr.',
    description: 'Brons används för vapen och smycken. Rika hövdingadömen. Hällristningar.',
    landscape: {
      rural: 'Öppna betesmarker, gravrösen på höjder, hällristningar vid vatten',
      coastal: 'Handelshamnar, bronsgjutning, skepp avbildade på hällar',
      urban: 'Inga städer - men centralplatser för handel och kult'
    },
    features: {
      buildings: 'Stora trähus, kultplatser, gravrösen av sten',
      people: 'Hövdingar med bronssvärd, kvinnor med spiralsmycken, präster',
      animals: 'Hästar (även för ridning), oxar för dragning, får, grisar',
      vegetation: 'Öppnare landskap, ljunghedar, ekar på kullar',
      technology: 'Bronssvärd, yxor, smycken, tvåhjuliga vagnar, skepp'
    },
    color: '#CD7F32'
  },

  // === JÄRNÅLDERN ===
  {
    id: 'iron_early',
    name: 'Äldre järnåldern',
    era: 'ancient',
    yearStart: -500,
    yearEnd: 400,
    yearLabel: '500 f.Kr. - 400 e.Kr.',
    description: 'Järn ersätter brons. Romersk påverkan. Runor börjar användas.',
    landscape: {
      rural: 'Välorganiserade gårdar, stensträngar, gravfält',
      coastal: 'Handelsplatser, kontakt med romarriket',
      urban: 'Inga städer - men stora gårdar och handelsplatser'
    },
    features: {
      buildings: 'Långhus med eldstad, förrådsbodar, gravfält med högar',
      people: 'Bönder, smeder, hövdingar med järnsvärd, trälar',
      animals: 'Hästar, kor, grisar, får, höns, hundar',
      vegetation: 'Jordbrukslandskap, ängar, mindre skog',
      technology: 'Järnverktyg, vävstolar, runor, mynt (importerade)'
    },
    color: '#708090'
  },
  {
    id: 'iron_late',
    name: 'Vendeltid',
    era: 'ancient',
    yearStart: 400,
    yearEnd: 800,
    yearLabel: '400 - 800 e.Kr.',
    description: 'Strax före vikingatiden. Rika gravfynd. Hjälmar och svärd av hög kvalitet.',
    landscape: {
      rural: 'Stormannagårdar, kultplatser, skippsättningar',
      coastal: 'Handelsplatser som Helgö, tidiga hamnar',
      urban: 'Handelsplatser börjar likna små städer'
    },
    features: {
      buildings: 'Hallbyggnader för hövdingar, smedjor, båtskjul',
      people: 'Kungar och hövdingar i praktfulla kläder, skalder, smeder',
      animals: 'Hästar (statussymbol), hundar, hökar för jakt',
      vegetation: 'Odlingslandskap, heliga lundar',
      technology: 'Praktfulla hjälmar, mönstervällade svärd, guldsmide'
    },
    color: '#4682B4'
  },

  // === VIKINGATIDEN ===
  {
    id: 'viking',
    name: 'Vikingatiden',
    era: 'medieval',
    yearStart: 800,
    yearEnd: 1050,
    yearLabel: '800 - 1050 e.Kr.',
    description: 'Vikingar seglar över haven. Handel och plundring. Birka och Sigtuna grundas.',
    landscape: {
      rural: 'Välorganiserade byar, runstenar vid vägar',
      coastal: 'Hamnar med vikingaskepp, varv, handelsplatser',
      urban: 'Birka, Sigtuna - tidiga handelsstäder med hus av trä'
    },
    features: {
      buildings: 'Långhus, hovsalar, stavkyrkor (sent), bryggkor',
      people: 'Vikingar med yxor och sköldar, köpmän, trälar, völvor',
      animals: 'Hästar, hundar, grisar, kor, höns, korpar (Odins fåglar)',
      vegetation: 'Odlingslandskap, äng och hage, skog för skeppsbygge',
      technology: 'Vikingaskepp, svärd, runstenar, silvermynt, vävnader'
    },
    color: '#2F4F4F'
  },

  // === MEDELTIDEN ===
  {
    id: 'medieval_early',
    name: 'Tidig medeltid',
    era: 'medieval',
    yearStart: 1050,
    yearEnd: 1300,
    yearLabel: '1050 - 1300 e.Kr.',
    description: 'Kristendomen etableras. Kyrkor byggs i sten. Städer grundas.',
    landscape: {
      rural: 'Byar med teglagårdar, kyrkor i varje socken',
      coastal: 'Fisklägen, Hansakontakter börjar',
      urban: 'Stockholm grundas, stenkyrkor, torg och handelsgator'
    },
    features: {
      buildings: 'Romanska stenkyrkor, kloster, enkla trähus, borgar',
      people: 'Munkar och nunnor, riddare, bönder, köpmän, kungar',
      animals: 'Hästar, oxar, får, getter, hundar, duvslag',
      vegetation: 'Odlingslandskap, äng, klostergårdar med örtagårdar',
      technology: 'Järnplogar, vattenkvarnar, stenkyrkor, pergament'
    },
    color: '#8B0000'
  },
  {
    id: 'medieval_late',
    name: 'Sen medeltid',
    era: 'medieval',
    yearStart: 1300,
    yearEnd: 1500,
    yearLabel: '1300 - 1500 e.Kr.',
    description: 'Hanseatisk handel. Digerdöden. Unionsstrid.',
    landscape: {
      rural: 'Ödebyar efter pesten, skogsåterväxt',
      coastal: 'Hansakontor, fiskhandel',
      urban: 'Befästa städer, kyrkor, rådhus, köpmannahus'
    },
    features: {
      buildings: 'Gotiska kyrkor, stenhus i städer, borgar',
      people: 'Hansaköpmän, riddare, bönder, borgare, tiggarmunkar',
      animals: 'Hästar, oxar, grisar, höns, hundar',
      vegetation: 'Mer skog (efter pesten), odlingsmark',
      technology: 'Armborst, krutvapen (sent), tryckpress (sent)'
    },
    color: '#800020'
  },

  // === STORMAKTSTIDEN ===
  {
    id: 'early_modern',
    name: 'Stormaktstiden',
    era: 'early_modern',
    yearStart: 1611,
    yearEnd: 1721,
    yearLabel: '1611 - 1721 e.Kr.',
    description: 'Sverige är en stormakt. Barock. Gustav II Adolf och Karl XII.',
    landscape: {
      rural: 'Reglerade byar, adelsgods, enkla torparstugor',
      coastal: 'Örlogshamnar, varv, fästningar',
      urban: 'Regelbundna rutnätsstäder, barockkyrkor, slott'
    },
    features: {
      buildings: 'Barockslott, kyrkor med torn, korsvirkeshus, torp',
      people: 'Soldater i uniformer, adelsmän med peruker, bönder, präster',
      animals: 'Hästar (kavalleri), oxar, kor, höns',
      vegetation: 'Odlingslandskap, trädgårdar i barockstil',
      technology: 'Musköter, kanoner, segelskepp, tryckta böcker'
    },
    color: '#4169E1'
  },

  // === 1800-TALET ===
  {
    id: 'industrial',
    name: '1800-talet',
    era: 'modern',
    yearStart: 1800,
    yearEnd: 1900,
    yearLabel: '1800 - 1900 e.Kr.',
    description: 'Industrialisering. Emigration till Amerika. Järnvägen byggs.',
    landscape: {
      rural: 'Skiftade byar, röda stugor, stenmurar',
      coastal: 'Fisklägen, sommargäster börjar komma',
      urban: 'Fabriker, arbetarbostäder, stationssamhällen'
    },
    features: {
      buildings: 'Röda trästugor, fabriker, järnvägsstationer, kyrkor',
      people: 'Fabriksarbetare, bönder, borgare i hög hatt, emigranter',
      animals: 'Hästar för transport, kor, grisar, höns',
      vegetation: 'Öppet jordbrukslandskap, björkalléer',
      technology: 'Ånglok, telegrafer, fotografi, gaslyktor'
    },
    color: '#556B2F'
  },

  // === TIDIGT 1900-TAL ===
  {
    id: 'early_1900s',
    name: 'Tidigt 1900-tal',
    era: 'modern',
    yearStart: 1900,
    yearEnd: 1950,
    yearLabel: '1900 - 1950 e.Kr.',
    description: 'Folkhemmet börjar byggas. Bilar dyker upp. Världskrigen.',
    landscape: {
      rural: 'Jordbruk med traktorer börjar, landsbygden avfolkas',
      coastal: 'Badorter, fiskeindustri',
      urban: 'Funktionalism, spårvagnar, varuhus, biografer'
    },
    features: {
      buildings: 'Funkishus, folkhemslägenheter, vattentorn, biografer',
      people: 'Arbetare med keps, kvinnor i 20-talsklänningar, barn i skoluniform',
      animals: 'Hästar (fortfarande vanliga), kor, hundar, katter',
      vegetation: 'Trädgårdsstäder, kolonilotter, parker',
      technology: 'Bilar (T-Ford), cyklar, radio, telefon, el i hemmen'
    },
    color: '#2E8B57'
  }
]

// Hitta period baserat på ID
export function getPeriodById(id: string): TimePeriod | undefined {
  return TIME_PERIODS.find(p => p.id === id)
}

// Gruppera perioder efter era
export function getPeriodsByEra(): Record<string, TimePeriod[]> {
  const grouped: Record<string, TimePeriod[]> = {}
  for (const period of TIME_PERIODS) {
    if (!grouped[period.era]) {
      grouped[period.era] = []
    }
    grouped[period.era].push(period)
  }
  return grouped
}

// Era-namn på svenska
export const ERA_NAMES: Record<string, string> = {
  prehistoric: 'Förhistorisk tid',
  ancient: 'Forntiden',
  medieval: 'Medeltiden',
  early_modern: 'Tidigmodern tid',
  modern: 'Modern tid'
}
