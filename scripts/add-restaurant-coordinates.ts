/**
 * Script to add sample coordinates to restaurants
 * Run this after the database migration to add latitude/longitude to existing restaurants
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample coordinates for different cities in India
const sampleCoordinates = [
  { city: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { city: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
  { city: 'Bangalore', latitude: 12.9716, longitude: 77.5946 },
  { city: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
  { city: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { city: 'Hyderabad', latitude: 17.3850, longitude: 78.4867 },
  { city: 'Pune', latitude: 18.5204, longitude: 73.8567 },
  { city: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714 },
  { city: 'Jaipur', latitude: 26.9124, longitude: 75.7873 },
  { city: 'Lucknow', latitude: 26.8467, longitude: 80.9462 }
]

async function addRestaurantCoordinates() {
  try {
    console.log('Adding coordinates to restaurants...')
    
    // Get all restaurants without coordinates
    const restaurants = await prisma.restaurant.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    })

    console.log(`Found ${restaurants.length} restaurants without coordinates`)

    for (const restaurant of restaurants) {
      // Try to determine city from address
      let selectedCoords = sampleCoordinates[0] // Default to Mumbai
      
      for (const coords of sampleCoordinates) {
        if (restaurant.address.toLowerCase().includes(coords.city.toLowerCase())) {
          selectedCoords = coords
          break
        }
      }

      // Add some random variation to make it more realistic
      const latVariation = (Math.random() - 0.5) * 0.1 // ±0.05 degrees
      const lngVariation = (Math.random() - 0.5) * 0.1 // ±0.05 degrees

      const latitude = selectedCoords.latitude + latVariation
      const longitude = selectedCoords.longitude + lngVariation

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          latitude: Math.round(latitude * 1000000) / 1000000, // Round to 6 decimal places
          longitude: Math.round(longitude * 1000000) / 1000000
        }
      })

      console.log(`Updated ${restaurant.name} with coordinates: ${latitude}, ${longitude}`)
    }

    console.log('Successfully added coordinates to all restaurants!')
  } catch (error) {
    console.error('Error adding coordinates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addRestaurantCoordinates()
