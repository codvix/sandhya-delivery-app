"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { MapPin, Navigation, ExternalLink, HelpCircle, Loader2 } from "lucide-react"
import { useLocation } from "@/hooks/use-location"

interface CoordinatePickerProps {
  latitude: string
  longitude: string
  onLatitudeChange: (value: string) => void
  onLongitudeChange: (value: string) => void
  className?: string
}

export function CoordinatePicker({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  className = ""
}: CoordinatePickerProps) {
  const [showHelp, setShowHelp] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const { loading: locationLoading, getCurrentLocation, error: locationError } = useLocation()

  const handleGetCurrentLocation = async () => {
    try {
      setSuccessMessage("Getting your location...")
      const coords = await getCurrentLocation()
      if (coords) {
        onLatitudeChange(coords.latitude.toString())
        onLongitudeChange(coords.longitude.toString())
        setSuccessMessage(`Location found! Coordinates: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`)
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000)
      }
    } catch (error) {
      setSuccessMessage("")
    }
  }

  const openInMaps = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`
      window.open(url, '_blank')
    }
  }

  const openGoogleMapsForCoordinates = () => {
    const url = "https://www.google.com/maps"
    window.open(url, '_blank')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
           <Input
             id="latitude"
             type="number"
             step="any"
             placeholder="e.g., 19.0760"
             value={latitude}
             onChange={(e) => {
               onLatitudeChange(e.target.value)
               setSuccessMessage("")
             }}
           />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="e.g., 72.8777"
            value={longitude}
            onChange={(e) => {
              onLongitudeChange(e.target.value)
              setSuccessMessage("")
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {locationLoading ? "Getting Location..." : "Use Current Location"}
        </Button>

        {latitude && longitude && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openInMaps}
          >
            <ExternalLink className="h-4 w-4" />
            View on Maps
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openGoogleMapsForCoordinates}
        >
          <MapPin className="h-4 w-4" />
          Open Google Maps
        </Button>
      </div>

      {locationError && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {locationError}
        </div>
      )}

      {successMessage && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 p-2 rounded">
          {successMessage}
        </div>
      )}

      <Collapsible open={showHelp} onOpenChange={setShowHelp}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <HelpCircle className="h-4 w-4 mr-1" />
            {showHelp ? "Hide Help" : "Show Help"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">How to Get Coordinates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>Method 1: Use Current Location</strong>
                <p className="text-muted-foreground">
                  Click "Use Current Location" to automatically get your current coordinates.
                </p>
              </div>
              <div>
                <strong>Method 2: Google Maps</strong>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Click "Open Google Maps" to open Google Maps in a new tab</li>
                  <li>Search for your restaurant location</li>
                  <li>Right-click on the exact location and select "What's here?"</li>
                  <li>Copy the coordinates from the popup (format: lat, lng)</li>
                  <li>Paste the latitude and longitude values in the fields above</li>
                </ol>
              </div>
              <div>
                <strong>Method 3: Manual Entry</strong>
                <p className="text-muted-foreground">
                  If you know the exact coordinates, enter them directly in the fields above.
                </p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

       {latitude && longitude && (
         <div className="text-xs text-green-600 bg-green-50 border border-green-200 p-2 rounded">
           <strong>✓ Coordinates set:</strong> {latitude}, {longitude}
         </div>
       )}
    </div>
  )
}
