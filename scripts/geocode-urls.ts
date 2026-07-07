import { Client } from "@googlemaps/google-maps-services-js";

const mapsClient = new Client({});

/**
 * Expands a short URL if necessary, and attempts to extract latitude and longitude
 * from the Google Maps URL.
 */
async function extractCoordsFromUrl(url: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Follow redirects to get the full URL
    const response = await fetch(url, { method: "HEAD" });
    const finalUrl = response.url;

    // Google Maps URLs usually contain coordinates in the format @lat,lng
    // Example: https://www.google.com/maps/place/.../@18.4800,-97.4110,15z
    const match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match && match.length >= 3) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      };
    }

    // Sometimes the coordinates are in the query string (e.g., ?q=lat,lng)
    const urlObj = new URL(finalUrl);
    const q = urlObj.searchParams.get("q") || urlObj.searchParams.get("ll");
    if (q) {
      const parts = q.split(",");
      if (parts.length === 2) {
        return {
          lat: parseFloat(parts[0]),
          lng: parseFloat(parts[1]),
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`Error extracting coords from URL ${url}:`, error);
    return null;
  }
}

/**
 * Uses the Google Maps SDK to search for a place by name and get its details.
 */
async function getPlaceInfoFromSDK(placeName: string, apiKey: string): Promise<{
  lat: number;
  lng: number;
  rating?: number;
  userRatingsTotal?: number;
  formattedAddress?: string;
} | null> {
  try {
    const response = await mapsClient.textSearch({
      params: {
        query: placeName,
        key: apiKey,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const place = response.data.results[0];
      const location = place.geometry?.location;
      if (location) {
        return { 
          lat: location.lat, 
          lng: location.lng,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          formattedAddress: place.formatted_address,
        };
      }
    }
    return null;
  } catch (error) {
    console.error(`Error using Google Maps SDK for ${placeName}:`, error);
    return null;
  }
}

/**
 * Enriches the imperdibles data with latitude and longitude coordinates.
 */
export async function enrichImperdiblesWithCoords(homePageData: any): Promise<void> {
  if (!homePageData || !homePageData.imperdibles || !Array.isArray(homePageData.imperdibles)) {
    return;
  }

  const apiKey = process.env.PUBLIC_GOOGLE_MAPS_API_KEY || "";

  for (const item of homePageData.imperdibles) {
    // If it already has coords (maybe we added them manually in Strapi later), skip
    if (item.lat && item.lng) continue;

    let placeInfo: { lat: number; lng: number; rating?: number; userRatingsTotal?: number; formattedAddress?: string } | null = null;

    if (item.direccionGoogleMaps) {
      // Intentar extraer de URL primero para coordenadas, pero igual buscaremos info rica
      const extractedCoords = await extractCoordsFromUrl(item.direccionGoogleMaps);
      if (extractedCoords) {
        placeInfo = { lat: extractedCoords.lat, lng: extractedCoords.lng };
      }
    }

    if (apiKey) {
      console.log(`Buscando detalles enriquecidos para: ${item.nombre}`);
      const richInfo = await getPlaceInfoFromSDK(`${item.nombre}, Tehuacán, Puebla`, apiKey);
      if (richInfo) {
        placeInfo = {
          // Mantener coords de URL si son más exactas, o usar las de SDK
          lat: placeInfo?.lat ?? richInfo.lat,
          lng: placeInfo?.lng ?? richInfo.lng,
          rating: richInfo.rating,
          userRatingsTotal: richInfo.userRatingsTotal,
          formattedAddress: richInfo.formattedAddress,
        };
      }
    }

    if (placeInfo) {
      item.lat = placeInfo.lat;
      item.lng = placeInfo.lng;
      if (placeInfo.rating || placeInfo.formattedAddress) {
        item.googleMapsInfo = {
          rating: placeInfo.rating,
          userRatingsTotal: placeInfo.userRatingsTotal,
          formattedAddress: placeInfo.formattedAddress,
        };
      }
      console.log(`📍 Info encontrada para ${item.nombre}: ${placeInfo.lat}, ${placeInfo.lng}`);
    } else {
      console.log(`⚠️ No se encontró info para ${item.nombre}`);
    }
  }
}
