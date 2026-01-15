/**
 * Historiska kartöverlägg för olika tidsperioder
 * Inkluderar kustlinjer, landskap och tillgängliga historiska kartor
 */

export interface HistoricalMapLayer {
  id: string
  name: string
  type: 'wms' | 'tiles' | 'geojson'
  url?: string
  layers?: string
  attribution?: string
  opacity: number
  description: string
}

export interface PeriodMapConfig {
  periodId: string
  periodName: string
  basemapStyle: 'terrain' | 'satellite' | 'simple'
  overlays: HistoricalMapLayer[]
  coastlineColor: string
  landColor: string
  waterColor: string
  description: string
}

// Historiska kartöverlägg per period
export const PERIOD_MAP_CONFIGS: Record<string, PeriodMapConfig> = {
  // === STENÅLDERN ===
  'stone_early': {
    periodId: 'stone_early',
    periodName: 'Äldre stenåldern',
    basemapStyle: 'terrain',
    overlays: [],
    coastlineColor: '#1e5f74',
    landColor: '#2d5016',
    waterColor: '#1a5276',
    description: 'Isen har nyss smält. Stora delar av Sverige är fortfarande under vatten. Inlandsisen finns kvar i norr.'
  },
  'stone_middle': {
    periodId: 'stone_middle',
    periodName: 'Mellanneolitikum',
    basemapStyle: 'terrain',
    overlays: [],
    coastlineColor: '#0077be',
    landColor: '#4a7c42',
    waterColor: '#2980b9',
    description: 'Littorinahavet står som högst. Mälaren och stora delar av Uppland är havsvikar.'
  },
  'stone_late': {
    periodId: 'stone_late',
    periodName: 'Yngre stenåldern',
    basemapStyle: 'terrain',
    overlays: [],
    coastlineColor: '#0088cc',
    landColor: '#556b2f',
    waterColor: '#3498db',
    description: 'Havet drar sig tillbaka. Kustlinjen börjar likna dagens men ligger fortfarande högre.'
  },

  // === BRONSÅLDERN ===
  'bronze': {
    periodId: 'bronze',
    periodName: 'Bronsåldern',
    basemapStyle: 'terrain',
    overlays: [],
    coastlineColor: '#CD7F32',
    landColor: '#8b7355',
    waterColor: '#2c3e50',
    description: 'Landskapet börjar likna dagens. Hällristningar vid dåtidens kustlinje.'
  },

  // === JÄRNÅLDERN ===
  'iron_early': {
    periodId: 'iron_early',
    periodName: 'Äldre järnåldern',
    basemapStyle: 'terrain',
    overlays: [],
    coastlineColor: '#708090',
    landColor: '#4a5568',
    waterColor: '#34495e',
    description: 'Jordbrukslandskap etablerat. Gravfält och fornborgar.'
  },
  'iron_late': {
    periodId: 'iron_late',
    periodName: 'Vendeltid',
    basemapStyle: 'terrain',
    overlays: [],
    coastlineColor: '#4682B4',
    landColor: '#2d3748',
    waterColor: '#2c3e50',
    description: 'Stormannagårdar och handelsplatser. Birka grundas snart.'
  },

  // === VIKINGATIDEN ===
  'viking': {
    periodId: 'viking',
    periodName: 'Vikingatiden',
    basemapStyle: 'terrain',
    overlays: [],
    coastlineColor: '#2F4F4F',
    landColor: '#1a202c',
    waterColor: '#1a365d',
    description: 'Birka och Sigtuna blomstrar. Vikingaskepp seglar från svenska hamnar.'
  },

  // === MEDELTIDEN ===
  'medieval_early': {
    periodId: 'medieval_early',
    periodName: 'Tidig medeltid',
    basemapStyle: 'simple',
    overlays: [],
    coastlineColor: '#8B0000',
    landColor: '#742a2a',
    waterColor: '#1a365d',
    description: 'Kristendomen etableras. Stenkyrkor byggs. Stockholm grundas 1252.'
  },
  'medieval_late': {
    periodId: 'medieval_late',
    periodName: 'Sen medeltid',
    basemapStyle: 'simple',
    overlays: [
      {
        id: 'medieval_roads',
        name: 'Medeltida vägar',
        type: 'geojson',
        opacity: 0.6,
        description: 'Ungefärliga sträckningar av medeltida huvudvägar'
      }
    ],
    coastlineColor: '#800020',
    landColor: '#553c9a',
    waterColor: '#2a4365',
    description: 'Hansastäder och handel. Digerdöden har härjat. Kalmarunionen.'
  },

  // === STORMAKTSTIDEN ===
  'early_modern': {
    periodId: 'early_modern',
    periodName: 'Stormaktstiden',
    basemapStyle: 'simple',
    overlays: [
      {
        id: 'lm_1600',
        name: 'Geometriska kartor',
        type: 'wms',
        url: 'https://geoservice.ist.supergis.de/wms/swe_1600/',
        layers: 'sweden_1600',
        attribution: 'Lantmäteriet geometriska kartor',
        opacity: 0.7,
        description: 'De första lantmäterikartor från 1600-talet'
      }
    ],
    coastlineColor: '#4169E1',
    landColor: '#2b6cb0',
    waterColor: '#1a365d',
    description: 'Sverige är en stormakt. Nya städer grundas. De första kartorna.'
  },

  // === 1800-TALET ===
  'industrial': {
    periodId: 'industrial',
    periodName: '1800-talet',
    basemapStyle: 'simple',
    overlays: [
      {
        id: 'lm_historical',
        name: 'Historiska ortofoton',
        type: 'wms',
        url: 'https://minkarta.lantmateriet.se/map/historiskaorto',
        layers: 'OI.Histortho_60',
        attribution: '© Lantmäteriet',
        opacity: 0.8,
        description: 'Historiska flygfoton från Lantmäteriet'
      }
    ],
    coastlineColor: '#556B2F',
    landColor: '#276749',
    waterColor: '#234e52',
    description: 'Industrialisering. Järnvägen byggs. Emigration till Amerika.'
  },

  // === TIDIGT 1900-TAL ===
  'early_1900s': {
    periodId: 'early_1900s',
    periodName: 'Tidigt 1900-tal',
    basemapStyle: 'simple',
    overlays: [
      {
        id: 'lm_1950',
        name: 'Ekonomiska kartan 1950',
        type: 'wms',
        url: 'https://minkarta.lantmateriet.se/map/historiskaorto',
        layers: 'OI.Histortho_50',
        attribution: '© Lantmäteriet',
        opacity: 0.8,
        description: 'Ekonomiska kartan från 1950-talet'
      }
    ],
    coastlineColor: '#2E8B57',
    landColor: '#22543d',
    waterColor: '#1a365d',
    description: 'Folkhemmet byggs. Bilar och telefoner. Två världskrig.'
  }
}

// Hämta kartkonfiguration för en period
export function getMapConfigForPeriod(periodId: string): PeriodMapConfig | undefined {
  return PERIOD_MAP_CONFIGS[periodId]
}

// Generera stil för undervattensområden baserat på period
export function getUnderwaterStyle(periodId: string): {
  fillColor: string
  fillOpacity: number
  strokeColor: string
  strokeWidth: number
} {
  const config = PERIOD_MAP_CONFIGS[periodId]
  if (!config) {
    return {
      fillColor: '#1a5276',
      fillOpacity: 0.4,
      strokeColor: '#2980b9',
      strokeWidth: 2
    }
  }

  return {
    fillColor: config.waterColor,
    fillOpacity: 0.5,
    strokeColor: config.coastlineColor,
    strokeWidth: 2
  }
}

// Generera legend-text för kartan
export function getMapLegend(periodId: string): {
  title: string
  items: { color: string; label: string }[]
} {
  const config = PERIOD_MAP_CONFIGS[periodId]
  if (!config) {
    return {
      title: 'Kartförklaring',
      items: []
    }
  }

  const items: { color: string; label: string }[] = [
    { color: config.waterColor, label: 'Havsområden under perioden' },
    { color: config.landColor, label: 'Landområden' }
  ]

  if (config.overlays.length > 0) {
    items.push({ color: '#f5af19', label: 'Historiska kartor tillgängliga' })
  }

  return {
    title: config.periodName,
    items
  }
}
