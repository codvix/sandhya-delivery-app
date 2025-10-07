/**
 * Distance calculation utilities
 * 
 * Provides functions to calculate distances between coordinates
 * using the Haversine formula for accurate distance calculation.
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate (user location)
 * @param coord2 Second coordinate (restaurant location)
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude)
  const dLon = toRadians(coord2.longitude - coord1.longitude)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate delivery fee based on distance and order value
 * @param distance Distance in kilometers
 * @param orderValue Order value in cents
 * @returns Delivery fee in cents
 */
export function calculateDeliveryFee(distance: number, orderValue: number): number {
  // Base delivery fee for orders below ₹199 (19900 cents)
  const baseFee = orderValue < 19900 ? 1000 : 0 // ₹10 for orders below ₹199
  
  // Distance-based fee: ₹10 per km
  const distanceFee = Math.ceil(distance) * 1000 // ₹10 per km
  
  return baseFee + distanceFee
}

/**
 * Get user's current location using browser geolocation API
 * @returns Promise with user coordinates
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}
