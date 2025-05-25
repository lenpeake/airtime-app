// utils/Location.js
import * as Location from 'expo-location';

let mockOverride = null; // ✅ Optional mock location for dev/testing

/**
 * Verifies whether the user is within 2 km of the given airport coordinates.
 * Optionally uses a mock override in development for testing purposes.
 *
 * @param {{ latitude: number, longitude: number }} airportCoords
 * @param {{ tooFarMessage?: string, onTooFar?: Function }} [options]
 * @returns {Promise<boolean>}
 */
export async function verifyUserAtAirport(airportCoords, options = {}) {
  try {
    let userPosition;

    if (__DEV__ && mockOverride) {
      console.log('📍 Using mock location override:', mockOverride);
      userPosition = { coords: mockOverride };
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('🚫 Location permission not granted');
        return false;
      }

      userPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
    }

    const distance = calculateDistance(
      userPosition.coords.latitude,
      userPosition.coords.longitude,
      airportCoords.latitude,
      airportCoords.longitude
    );

    const withinRange = distance <= 2.0;
    if (!withinRange && options.tooFarMessage) {
      console.warn('⚠️ User too far from airport:', distance.toFixed(2), 'km');
      if (typeof options.onTooFar === 'function') {
        options.onTooFar(distance);
      }
    }

    return withinRange;
  } catch (err) {
    console.error('❌ Location error in verifyUserAtAirport:', err.message || err);
    return false;
  }
}

/**
 * Calculates great-circle distance between two lat/lon points using Haversine formula.
 * @returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Sets a mock location override for development or testing.
 * @param {{ latitude: number, longitude: number } | null} coords
 */
export function setMockLocation(coords) {
  mockOverride = coords;
}
