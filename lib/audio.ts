/**
 * Utility functions for playing notification sounds
 */

export function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/happy-bells-notification-937.wav')
    audio.volume = 0.8
    
    audio.play().catch((error) => {
      console.log('Notification sound failed:', error)
      // Try to play on next user interaction
      const playOnInteraction = () => {
        audio.play().catch(() => {})
        document.removeEventListener('click', playOnInteraction)
        document.removeEventListener('keydown', playOnInteraction)
        document.removeEventListener('touchstart', playOnInteraction)
      }
      document.addEventListener('click', playOnInteraction, { once: true })
      document.addEventListener('keydown', playOnInteraction, { once: true })
      document.addEventListener('touchstart', playOnInteraction, { once: true })
    })
  } catch (error) {
    console.log('Audio error:', error)
  }
}

/**
 * Initialize audio context for better sound support
 * Call this on user interaction to enable audio
 */
export function initializeAudio() {
  try {
    // Create a silent audio to initialize the audio context
    const audio = new Audio()
    audio.src = '/sounds/happy-bells-notification-937.wav'
    audio.volume = 0
    audio.play().then(() => {
      audio.pause()
      audio.currentTime = 0
    }).catch(() => {
      // Ignore errors during initialization
    })
  } catch (error) {
    console.log('Audio initialization error:', error)
  }
}
