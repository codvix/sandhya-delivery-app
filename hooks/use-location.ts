"use client"

import { useState, useEffect, useCallback } from 'react'
import { Coordinates } from '@/lib/utils/distance'

interface LocationState {
  coordinates: Coordinates | null
  loading: boolean
  error: string | null
  permission: PermissionState | null
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coordinates: null,
    loading: false,
    error: null,
    permission: null
  })

  const getCurrentLocation = useCallback(async (): Promise<Coordinates> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by this browser'
        setState(prev => ({ ...prev, loading: false, error }))
        reject(new Error(error))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          setState(prev => ({ 
            ...prev, 
            coordinates, 
            loading: false, 
            error: null 
          }))
          resolve(coordinates)
        },
        (error) => {
          let errorMessage = 'Unable to get your location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
            default:
              errorMessage = `Location error: ${error.message}`
              break
          }

          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: errorMessage 
          }))
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }, [])

  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setState(prev => ({ ...prev, permission: 'granted' }))
      return
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      setState(prev => ({ ...prev, permission: permission.state }))
    } catch (error) {
      console.warn('Permission check failed:', error)
      setState(prev => ({ ...prev, permission: 'granted' }))
    }
  }, [])

  const requestLocation = useCallback(async () => {
    try {
      await checkPermission()
      return await getCurrentLocation()
    } catch (error) {
      throw error
    }
  }, [checkPermission, getCurrentLocation])

  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  return {
    ...state,
    getCurrentLocation: requestLocation,
    checkPermission
  }
}
