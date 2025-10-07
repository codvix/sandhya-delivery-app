/**
 * Tests for distance calculation utilities
 */

import { calculateDistance, calculateDeliveryFee } from '../distance'

describe('Distance Calculation', () => {
  test('should calculate distance between two coordinates', () => {
    // Mumbai to Delhi (approximately 1150km)
    const mumbai = { latitude: 19.0760, longitude: 72.8777 }
    const delhi = { latitude: 28.7041, longitude: 77.1025 }
    
    const distance = calculateDistance(mumbai, delhi)
    expect(distance).toBeCloseTo(1150, -2) // Within 100km accuracy
  })

  test('should calculate distance for same coordinates', () => {
    const coord = { latitude: 19.0760, longitude: 72.8777 }
    const distance = calculateDistance(coord, coord)
    expect(distance).toBe(0)
  })

  test('should calculate delivery fee correctly', () => {
    // Order below ₹199, 2km distance
    const fee1 = calculateDeliveryFee(2, 15000) // ₹150 order, 2km
    expect(fee1).toBe(3000) // ₹10 base + ₹20 distance = ₹30

    // Order above ₹199, 3km distance  
    const fee2 = calculateDeliveryFee(3, 25000) // ₹250 order, 3km
    expect(fee2).toBe(3000) // ₹0 base + ₹30 distance = ₹30

    // Order below ₹199, 0km distance
    const fee3 = calculateDeliveryFee(0, 15000) // ₹150 order, 0km
    expect(fee3).toBe(1000) // ₹10 base + ₹0 distance = ₹10
  })
})
