import { NextRequest, NextResponse } from 'next/server'
import { analyzeLocation, getUpliftRegion } from '@/lib/sgu-data'
import { TIME_PERIODS, getPeriodById, type TimePeriod } from '@/lib/time-periods'
import { analyzeLocationType, getCityDescription, type LocationAnalysis } from '@/lib/city-detection'

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, period, imageBase64 } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude och longitude krävs' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API-nyckel saknas' },
        { status: 500 }
      )
    }

    // Hämta tidsperiod
    const selectedPeriod = getPeriodById(period) || TIME_PERIODS[0]

    // Analysera platstyp (urban/kust/landsbygd)
    const locationAnalysis = analyzeLocationType(latitude, longitude, selectedPeriod.yearStart)

    // För förhistoriska perioder, hämta också geologisk data
    let geoAnalysis = null
    if (selectedPeriod.era === 'prehistoric' || selectedPeriod.era === 'ancient') {
      // Konvertera till yearsBP för geologisk modell
      const yearsBP = selectedPeriod.yearStart < 0
        ? Math.abs(selectedPeriod.yearStart) + 2000  // f.Kr -> BP (ungefär)
        : 2000 - selectedPeriod.yearStart  // e.Kr -> BP

      // Hitta närmaste SGU-period
      const sguPeriodMap: Record<string, string> = {
        'stone_early': 'boreal',
        'stone_middle': 'atlantic_early',
        'stone_late': 'atlantic_late',
        'bronze': 'subboreal',
        'iron_early': 'subboreal',
        'iron_late': 'subboreal'
      }
      const sguPeriod = sguPeriodMap[selectedPeriod.id] || 'atlantic_early'

      try {
        geoAnalysis = await analyzeLocation(latitude, longitude, sguPeriod)
      } catch (error) {
        console.error('Geo analysis error:', error)
      }
    }

    // Analysera bilden med Gemini 1.5 Flash (vision)
    let viewDescription = ''
    let hasPerson = false
    let personDescription = ''
    if (imageBase64) {
      try {
        const visionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.OPENROUTER_SITE_NAME || 'https://stenaldern.app',
            'X-Title': 'Stenåldern App'
          },
          body: JSON.stringify({
            model: 'google/gemini-flash-1.5',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Analyze this image and respond in JSON format:
{
  "landscape": "description of terrain, horizon, water, vegetation, sky, viewing angle",
  "hasPerson": true/false,
  "personDetails": "if person present: gender, approximate age, pose, position in frame, facial features to preserve"
}
Be concise but specific. Response ONLY the JSON, no other text.`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${imageBase64}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 400
          })
        })

        if (visionResponse.ok) {
          const visionData = await visionResponse.json()
          const content = visionData.choices?.[0]?.message?.content || ''
          try {
            // Försök parsa JSON-svaret
            const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim()
            const parsed = JSON.parse(cleanJson)
            viewDescription = parsed.landscape || ''
            hasPerson = parsed.hasPerson || false
            personDescription = parsed.personDetails || ''
          } catch {
            // Fallback om JSON-parsing misslyckas
            viewDescription = content
          }
        }
      } catch (error) {
        console.error('Vision API error:', error)
      }
    }

    // Generera bildprompt baserat på period, platstyp och eventuell geologisk data
    const imagePrompt = generateImagePrompt(
      selectedPeriod,
      locationAnalysis,
      geoAnalysis,
      viewDescription,
      hasPerson,
      personDescription
    )

    // Generera bild med Gemini via OpenRouter
    let generatedImageUrl = null
    let generatedImageBase64 = null
    let imageGenerationError = null

    try {
      const imageResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.OPENROUTER_SITE_NAME || 'https://stenaldern.app',
          'X-Title': 'Stenåldern App'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          modalities: ['text', 'image'],
          messages: [
            {
              role: 'user',
              content: imageBase64
                ? [
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:image/jpeg;base64,${imageBase64}`
                      }
                    },
                    {
                      type: 'text',
                      text: hasPerson
                        ? `COSTUME CHANGE ONLY - Keep the exact same person, same face, same pose, same background composition.

TASK: Change ONLY this person's clothes and hair to ${selectedPeriod.name} (${selectedPeriod.yearLabel}) Scandinavian style.

NEW OUTFIT: ${getPeriodClothing(selectedPeriod.yearStart).description}
NEW HAIRSTYLE: ${getPeriodClothing(selectedPeriod.yearStart).hair}
ACCESSORIES: ${getPeriodClothing(selectedPeriod.yearStart).accessories}

KEEP UNCHANGED: The person's face, skin, eyes, expression, body position, hands, and the general composition.

This is like a movie costume department changing an actor's wardrobe - same person, different historical clothes.`
                        : `Transform this image to show how this exact location and view would have looked during ${selectedPeriod.name} (${selectedPeriod.yearLabel}) in Scandinavia. Keep the same composition, viewing angle, and horizon line, but replace all modern elements with the historical scene. ${imagePrompt}`
                    }
                  ]
                : `Generate a photorealistic image: ${imagePrompt}`
            }
          ]
        })
      })

      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        const message = imageData.choices?.[0]?.message

        // Format: Gemini returnerar bilder i message.images array
        if (message?.images && Array.isArray(message.images)) {
          for (const img of message.images) {
            if (img.type === 'image_url' && img.image_url?.url) {
              const url = img.image_url.url
              if (url.startsWith('data:image')) {
                generatedImageBase64 = url.split(',')[1]
              } else {
                generatedImageUrl = url
              }
              break
            }
          }
        }

        // Fallback: kolla i content om det är en array
        if (!generatedImageBase64 && !generatedImageUrl) {
          const content = message?.content
          if (Array.isArray(content)) {
            for (const part of content) {
              if (part.type === 'image_url' && part.image_url?.url) {
                const url = part.image_url.url
                if (url.startsWith('data:image')) {
                  generatedImageBase64 = url.split(',')[1]
                } else {
                  generatedImageUrl = url
                }
                break
              }
            }
          }
        }

        if (!generatedImageBase64 && !generatedImageUrl) {
          imageGenerationError = 'Modellen genererade ingen bild'
        }
      } else {
        const errorData = await imageResponse.json()
        console.error('Image generation error:', errorData)
        imageGenerationError = errorData.error?.message || 'Bildgenerering misslyckades'
      }
    } catch (error) {
      console.error('Image generation exception:', error)
      imageGenerationError = 'Kunde inte ansluta till bildgenererings-API'
    }

    // Bygg landskapsbeskrivning baserat på platstyp
    const landscapeDescription = locationAnalysis.type === 'urban' && locationAnalysis.cityExistedInPeriod
      ? selectedPeriod.landscape.urban
      : locationAnalysis.type === 'coastal'
        ? selectedPeriod.landscape.coastal
        : selectedPeriod.landscape.rural

    return NextResponse.json({
      success: true,
      // Period-info
      period: selectedPeriod.name,
      periodId: selectedPeriod.id,
      yearRange: selectedPeriod.yearLabel,
      description: selectedPeriod.description,

      // Platstyp
      locationType: locationAnalysis.type,
      locationDescription: locationAnalysis.historicalDescription,
      nearestCity: locationAnalysis.nearestCity?.name,
      distanceToCity: locationAnalysis.distanceToCity,
      cityExistedInPeriod: locationAnalysis.cityExistedInPeriod,

      // Geologisk data (om tillgänglig)
      geologicalData: geoAnalysis ? {
        currentElevation: geoAnalysis.elevation,
        region: geoAnalysis.region,
        wasUnderwater: geoAnalysis.seaStatus.wasUnderwater,
        historicalElevation: geoAnalysis.seaStatus.historicalElevation,
        seaLevel: geoAnalysis.seaStatus.seaLevel,
        totalUplift: geoAnalysis.seaStatus.uplift,
        seaPhase: {
          name: geoAnalysis.seaStatus.seaPhase.name,
          salinity: geoAnalysis.seaStatus.seaPhase.salinity,
          description: geoAnalysis.seaStatus.seaPhase.description
        }
      } : null,

      // Landskapsbeskrivning
      historicalContext: {
        landscape: landscapeDescription,
        vegetation: selectedPeriod.features.vegetation,
        fauna: selectedPeriod.features.animals,
        buildings: selectedPeriod.features.buildings,
        people: selectedPeriod.features.people,
        technology: selectedPeriod.features.technology,
        locationAnalysis: geoAnalysis?.seaStatus.description
      },

      // Bildgenerering
      imagePrompt,
      viewDescription,
      generatedImageUrl,
      generatedImageBase64,
      imageGenerationError
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Något gick fel vid bearbetningen' },
      { status: 500 }
    )
  }
}

/**
 * Generera en detaljerad bildprompt baserat på period och platstyp
 * VIKTIGT: Strikt historisk korrekthet, inga anakronismer
 */
function generateImagePrompt(
  period: TimePeriod,
  locationAnalysis: LocationAnalysis,
  geoAnalysis: Awaited<ReturnType<typeof analyzeLocation>> | null,
  viewDescription: string,
  hasPerson: boolean = false,
  personDescription: string = ''
): string {
  let prompt = ''

  // Kolla om platsen var under vatten (för förhistoriska perioder)
  if (geoAnalysis?.seaStatus.wasUnderwater) {
    const depth = geoAnalysis.seaStatus.seaLevel - geoAnalysis.seaStatus.historicalElevation

    // VIKTIGT: Undervattensscen - INGA träd, INGA landväxter
    prompt = `Underwater scene, viewing from beneath the water surface. `
    prompt += `This location is submerged under ${Math.round(depth)} meters of water. `
    prompt += `Time period: ${period.yearLabel}, ${geoAnalysis.seaStatus.seaPhase.name} in Scandinavia. `

    if (geoAnalysis.seaStatus.seaPhase.salinity === 'freshwater') {
      prompt += `Clear freshwater environment. Sandy or rocky bottom visible. `
      prompt += `Aquatic plants like pondweed and water lilies. Pike, perch, and bream swimming. `
      prompt += `NO trees, NO grass, NO land animals - this is completely underwater. `
    } else if (geoAnalysis.seaStatus.seaPhase.salinity === 'brackish') {
      prompt += `Murky brackish water with greenish tint and limited visibility. `
      prompt += `Seaweed, algae on rocks. Cod, herring, flounder near the bottom. `
      prompt += `NO trees, NO land vegetation - only marine and brackish water life. `
    } else {
      prompt += `Clear saltwater marine environment. `
      prompt += `Kelp and seaweed attached to rocks. Schools of herring, cod. Seals visible. `
      prompt += `NO trees, NO terrestrial plants - purely marine ecosystem. `
    }

    prompt += `Sunlight filtering down from the surface above, creating light rays through water. `
    prompt += `Realistic underwater photography style. Bubbles, particles in water. `

  } else {
    // Landbaserad scen - strikt periodkorrekt
    prompt = `Historical scene from ${period.name} (${period.yearLabel}) in Scandinavia. `

    // KRITISK: Exkludera saker som INTE fanns under perioden
    const exclusions = getHistoricalExclusions(period.yearStart)

    if (locationAnalysis.type === 'urban' && locationAnalysis.cityExistedInPeriod && locationAnalysis.nearestCity) {
      prompt += `Urban scene in ${locationAnalysis.nearestCity.name}: ${period.landscape.urban}. `
      prompt += `Architecture: ONLY ${period.features.buildings}. `
      prompt += `People: ${period.features.people}. `

      const cityDesc = getCityDescription(locationAnalysis.nearestCity, period.yearStart)
      if (cityDesc) {
        prompt += `${cityDesc} `
      }
    } else if (locationAnalysis.type === 'coastal') {
      prompt += `Coastal Scandinavian scene: ${period.landscape.coastal}. `
      prompt += `Structures: ONLY ${period.features.buildings}. `
      prompt += `Coastal activity: fishing, ${period.features.people}. `
    } else {
      prompt += `Rural Scandinavian landscape: ${period.landscape.rural}. `
      prompt += `Dwellings: ONLY ${period.features.buildings}. `
      prompt += `People: ${period.features.people}. `
    }

    prompt += `Flora: ONLY ${period.features.vegetation}. `
    prompt += `Fauna: ${period.features.animals}. `
    prompt += `Tools and technology: ONLY ${period.features.technology}. `

    // Lägg till exkluderingar
    if (exclusions.length > 0) {
      prompt += `CRITICAL - DO NOT INCLUDE: ${exclusions.join(', ')}. `
    }

    if (viewDescription) {
      prompt += `Match this composition: ${viewDescription}. `
    }
  }

  // Om det finns en person i bilden, transformera deras utseende
  if (hasPerson && personDescription) {
    const clothing = getPeriodClothing(period.yearStart)
    prompt += `\n\nIMPORTANT - PERSON TRANSFORMATION: `
    prompt += `There is a person in this image (${personDescription}). `
    prompt += `KEEP their face, body position, and pose EXACTLY the same. `
    prompt += `TRANSFORM their clothing, hairstyle, and accessories to match ${period.name}: `
    prompt += `${clothing.description}. `
    prompt += `Hair: ${clothing.hair}. `
    prompt += `Accessories: ${clothing.accessories}. `
    prompt += `DO NOT change the person's facial features, expression, or body position. `
    prompt += `ONLY change their outfit and hairstyle to be historically accurate. `
  }

  prompt += `Photorealistic, natural lighting, documentary style. `
  prompt += `Strict historical accuracy required. No anachronisms.`

  return prompt
}

/**
 * Returnera saker som INTE fanns under en viss tidsperiod
 */
function getHistoricalExclusions(yearStart: number): string[] {
  const exclusions: string[] = []

  // Alltid exkludera moderna element
  exclusions.push('cars', 'power lines', 'asphalt roads', 'plastic', 'modern buildings', 'street lights')

  if (yearStart < 1900) {
    exclusions.push('automobiles', 'electricity', 'telephone poles', 'concrete buildings')
  }
  if (yearStart < 1800) {
    exclusions.push('factories', 'steam engines', 'iron bridges', 'gas lamps')
  }
  if (yearStart < 1600) {
    exclusions.push('baroque architecture', 'wigs', 'cannons', 'printed books')
  }
  if (yearStart < 1000) {
    exclusions.push('stone churches', 'castles', 'knights in armor', 'windmills')
  }
  if (yearStart < 400) {
    exclusions.push('Christian symbols', 'runic stones with crosses', 'longships with sails')
  }
  if (yearStart < -500) {
    exclusions.push('iron tools', 'coins', 'written text')
  }
  if (yearStart < -1700) {
    exclusions.push('bronze weapons', 'wheeled carts', 'horses for riding')
  }
  if (yearStart < -4000) {
    exclusions.push('farming', 'domestic cattle', 'pottery', 'permanent houses')
  }

  return exclusions
}

/**
 * Returnera periodspecifika kläder, frisyrer och accessoarer
 */
function getPeriodClothing(yearStart: number): {
  description: string
  hair: string
  accessories: string
} {
  // Äldre stenåldern (före 4000 f.Kr.)
  if (yearStart < -4000) {
    return {
      description: 'Simple animal hide clothing - deer or seal skin tunic, leather wrappings around legs and feet. Raw, untanned furs for warmth. No woven fabric.',
      hair: 'Long, unkempt natural hair. Men may have beards. No elaborate styling, possibly tied back with leather thong.',
      accessories: 'Bone or antler pendants, shell necklaces, leather pouches. Stone tools at belt. NO metal of any kind.'
    }
  }

  // Yngre stenåldern / Bondestenåldern (4000-1700 f.Kr.)
  if (yearStart < -1700) {
    return {
      description: 'Woven wool or linen tunics, reaching to knees. Leather belt. Simple leather shoes or sandals. Fur cloaks for warmth.',
      hair: 'Shoulder-length hair, sometimes braided. Men with short beards. Simple bone or wooden hair pins.',
      accessories: 'Amber beads, bone buttons, flint knife at belt. Pottery vessels. NO metal jewelry.'
    }
  }

  // Bronsåldern (1700-500 f.Kr.)
  if (yearStart < -500) {
    return {
      description: 'Wool tunics with woven patterns, bronze fibulae (brooches) to fasten cloaks. Women in long dresses with corded skirts. Leather belts with bronze buckles.',
      hair: 'Elaborate hairstyles - women with hair nets, men with topknots or braids. Bronze hair rings.',
      accessories: 'Bronze spiral arm rings, neck rings (torques), belt plates with sun symbols. Bronze daggers for high status.'
    }
  }

  // Äldre järnåldern (500 f.Kr. - 400 e.Kr.)
  if (yearStart < 400) {
    return {
      description: 'Wool and linen clothing. Men in trousers and tunics, women in long peplos-style dresses. Iron fibulae. Leather boots.',
      hair: 'Suebian knot (hair tied on one side) for some men. Women with long braided hair. Red hair dye from plants.',
      accessories: 'Iron and bronze jewelry, glass beads imported from Rome. Belt buckles, arm rings. Runic amulets.'
    }
  }

  // Vendeltid och vikingatid (400-1050 e.Kr.)
  if (yearStart < 1050) {
    return {
      description: 'Viking-age clothing: men in wool tunics over trousers, leather belts. Women in linen underdress with wool overdress (hangerock) fastened with oval brooches.',
      hair: 'Men: long hair, often tied back, beards common. Women: long hair, often covered with linen cap or headscarf. Braids.',
      accessories: 'Silver and bronze jewelry - Thor hammers, arm rings, bead necklaces. Decorated leather belts. Iron knives.'
    }
  }

  // Tidig medeltid (1050-1300)
  if (yearStart < 1300) {
    return {
      description: 'Medieval tunics reaching below knee for men, long dresses for women. Wool cloaks with hood (chaperon). Simple leather shoes.',
      hair: 'Men: bowl-cut hair, clean-shaven faces becoming common. Women: hair covered by wimple or veil, only maidens show hair.',
      accessories: 'Simple cross pendants, leather pouches, belt knives. Pilgrim badges. NO elaborate jewelry for common folk.'
    }
  }

  // Sen medeltid (1300-1500)
  if (yearStart < 1500) {
    return {
      description: 'Fitted tunics (cotehardie) for men, long gowns with fitted bodices for women. Pointed shoes (poulaines). Wool and linen, some silk for wealthy.',
      hair: 'Men: hair to ears or shoulders, some with fashionable forked beards. Women: elaborate headdresses (hennin), hair hidden.',
      accessories: 'Belt pouches, rosary beads, decorative belt buckles. Brooches and rings for the wealthy.'
    }
  }

  // Stormaktstiden (1500-1700)
  if (yearStart < 1700) {
    return {
      description: 'Doublets and breeches for men, full skirts with bodices for women. Ruffs or falling collars. Leather boots for men, heeled shoes for women.',
      hair: 'Men: longer hair becoming fashionable, mustaches and pointed beards. Women: hair styled up with curls, often decorated.',
      accessories: 'Lace collars, decorative buttons, rapiers for gentlemen. Pearl jewelry, embroidered gloves.'
    }
  }

  // 1700-talet
  if (yearStart < 1800) {
    return {
      description: 'Coat, waistcoat and breeches for men. Wide skirts with tight bodices for women. Elaborate silk and brocade for wealthy, simple wool for common.',
      hair: 'Men: powdered wigs or natural hair tied back. Women: elaborate tall hairstyles, powdered. Tricorn hats for men.',
      accessories: 'Snuff boxes, pocket watches, fans for ladies. Buckled shoes. Elaborate lace cuffs.'
    }
  }

  // 1800-talet
  if (yearStart < 1900) {
    return {
      description: 'Men: dark suits, top hats, cravats. Women: long dresses with crinolines (early) or bustles (late), high collars. Cotton and wool.',
      hair: 'Men: short hair, sideburns or full beards. Women: elaborate updos with curls, bonnets outdoors.',
      accessories: 'Pocket watches with chains, walking canes for gentlemen. Parasols, jewelry, gloves for ladies.'
    }
  }

  // Tidigt 1900-tal
  return {
    description: 'Men: three-piece suits, bowler or flat caps. Women: long skirts to early 1920s, then shorter. Wool coats, cotton shirts.',
    hair: 'Men: short, neat hair, mustaches common. Women: Gibson Girl updos (early), then bob cuts (1920s).',
    accessories: 'Wristwatches replacing pocket watches. Cloche hats for women. Simple jewelry.'
  }
}
