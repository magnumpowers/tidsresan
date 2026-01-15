# Stenåldern App

En webbapp som visar hur en plats i Skandinavien såg ut under stenåldern, baserat på geologisk data om landhöjning och historiska havsnivåer.

## Tech Stack
- **Frontend**: Next.js 14 + TypeScript
- **AI**: OpenRouter (Gemini 1.5 Flash för bildanalys, Imagen 3 för bildgenerering)
- **Geologisk data**: Beräkningsmodell baserad på SGU:s strandförskjutningsdata
- **Elevation**: Open-Elevation API
- **Styling**: CSS (ingen framework)

## Kommandon

```bash
npm install     # Installera dependencies
npm run dev     # Starta utvecklingsserver (localhost:3000)
npm run build   # Bygga för produktion
npm run lint    # Kör linter
```

## Miljövariabler

Skapa `.env.local` med:
```
OPENROUTER_API_KEY=din_nyckel_här
```

## Projektstruktur

```
src/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # Huvudendpoint - analys + bildgenerering
│   │   └── geology/route.ts    # Ren geologisk data
│   ├── page.tsx                # Huvudsida
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Styling
├── lib/
│   ├── sgu-data.ts             # Geologisk beräkningsmodell
│   └── historical-data.ts      # (legacy) Statisk historisk data
└── components/
```

## Geologisk modell

### Datakällor
Modellen bygger på:
- **Landhöjningsdata** från Lantmäteriet/SGU (mm/år per region)
- **Östersjöns utvecklingsfaser** från geologisk forskning
- **Strandförskjutningskurvor** från SGU
- **Elevationsdata** från Open-Elevation API

### Regioner och landhöjning
| Region | Landhöjning (mm/år) |
|--------|---------------------|
| Höga kusten | 8.5 |
| Norrland kust | 7.5 |
| Stockholm | 4.5 |
| Gotland | 2.0 |
| Skåne | 0.5 |

### Östersjöns faser
| Fas | Period (BP) | Havsnivå | Salinitet |
|-----|-------------|----------|-----------|
| Baltiska issjön | 14000-11700 | +25m | Sötvatten |
| Yoldiahavet | 11700-10700 | -25m | Bräckvatten |
| Ancylussjön | 10700-9000 | -10m | Sötvatten |
| Littorinahavet | 9000-4000 | +5m | Saltvatten |
| Östersjön | 4000-nu | 0m | Bräckvatten |

## API Endpoints

### GET /api/geology
Hämta geologisk analys för en koordinat och tidsperiod.

```
GET /api/geology?lat=59.3293&lng=18.0686&period=atlantic_early
```

**Response:**
```json
{
  "success": true,
  "period": { "name": "Äldre Atlantikum", "yearsBP": 7000 },
  "elevation": 27,
  "region": "stockholm",
  "seaStatus": {
    "wasUnderwater": true,
    "historicalElevation": -32,
    "seaLevel": 5,
    "uplift": 59,
    "seaPhase": { "name": "Littorinahavet" }
  }
}
```

### POST /api/generate
Generera komplett analys med AI-bild.

```json
{
  "latitude": 59.3293,
  "longitude": 18.0686,
  "period": "atlantic_early",
  "imageBase64": "..." // Valfritt
}
```

## Tidsperioder

| ID | Namn | År BP | Kultur |
|----|------|-------|--------|
| late_glacial | Senglacial | 14000-11700 | Hamburgkulturen |
| preboreal | Preboreal | 11700-10200 | Maglemosekulturen |
| boreal | Boreal | 10200-8000 | Maglemosekulturen |
| atlantic_early | Äldre Atlantikum | 8000-6000 | Kongemosekulturen |
| atlantic_late | Yngre Atlantikum | 6000-5000 | Ertebøllekulturen |
| subboreal | Subboreal | 5000-2500 | Trattbägarkulturen |

## Flöde

1. Användaren anger position (GPS eller manuellt)
2. Väljer tidsperiod
3. (Valfritt) Laddar upp foto
4. API:et:
   - Hämtar elevation från Open-Elevation
   - Beräknar landhöjning sedan vald period
   - Bestämmer historisk havsnivå
   - Avgör om platsen var under vatten
   - Genererar landskapsbeskrivning
   - Skapar bildprompt
   - (Valfritt) Genererar AI-bild med Imagen 3

## Vetenskapliga källor

- SGU:s strandförskjutningsmodell
- Lantmäteriets landhöjningsdata
- Andrén et al. (2011) "The Holocene history of the Baltic Sea"
- Påsse & Andersson (2005) "Shore-level displacement in Fennoscandia"
