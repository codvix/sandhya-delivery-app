"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { initializeAudio } from "@/lib/audio"

export function AudioInitializer() {
  const [audioEnabled, setAudioEnabled] = useState(false)

  const handleEnableAudio = () => {
    try {
      initializeAudio()
      setAudioEnabled(true)
    } catch (error) {
      console.log('Failed to initialize audio:', error)
    }
  }

  if (audioEnabled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Volume2 className="h-4 w-4" />
        <span>Audio enabled</span>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnableAudio}
      className="flex items-center gap-2"
    >
      <VolumeX className="h-4 w-4" />
      <span>Enable Sound</span>
    </Button>
  )
}
