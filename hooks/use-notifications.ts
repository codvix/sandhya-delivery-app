"use client"

import { useEffect, useState, useRef } from "react"

interface Order {
  id: string
  orderNumber: string
  user: {
    name: string
    phone: string
  }
  restaurant: {
    name: string
  }
  total: number
  createdAt: string
}

interface UseNotificationsOptions {
  onNewOrder?: (order: Order) => void
}

export function useNotifications({ onNewOrder }: UseNotificationsOptions = {}) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [newOrderCount, setNewOrderCount] = useState(0)
  const lastOrderCountRef = useRef<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize audio for notification sound
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()
      // Use external notification sound from public/sounds
      audioRef.current.src = "/sounds/happy-bells-notification-937.wav"
    }
  }, [])

  // Request current permission on mount (browser only)
  useEffect(() => {
    if (typeof window === "undefined") return
    setPermission(Notification.permission)
  }, [])

  // Cleanup any polling when unmounting
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  async function startPolling() {
    if (pollingIntervalRef.current) return

    // Run immediately then at interval
    const poll = async () => {
      try {
        const response = await fetch("/api/admin/orders")
        const data = await response.json()
        const orders: Order[] = data?.orders || []

        const currentCount = orders.length
        const lastCount = lastOrderCountRef.current

        if (currentCount > lastCount) {
          const diff = currentCount - lastCount
          setNewOrderCount((c) => c + diff)
          lastOrderCountRef.current = currentCount

          const latest = orders[0]

          // Play sound if possible
          try {
            await audioRef.current?.play()
          } catch (_) {
            // ignore autoplay errors
          }

          // Fire browser notification if permitted
          if (permission === "granted" && typeof window !== "undefined") {
            new Notification("New order received", {
              body: latest ? `#${latest.orderNumber} - ${latest.user.name}` : undefined,
            })
          }

          // Callback to consumer
          if (latest && onNewOrder) {
            onNewOrder(latest)
          }
        } else if (currentCount !== lastCount) {
          // Normalize baseline if counts decreased
          lastOrderCountRef.current = currentCount
        }
      } catch (err) {
        // Swallow errors to keep polling resilient
      }
    }

    await poll()
    pollingIntervalRef.current = setInterval(poll, 10000)
  }

  function stopPolling() {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  async function enableNotifications() {
    if (typeof window === "undefined") return

    let currentPermission: NotificationPermission = Notification.permission
    if (currentPermission === "default") {
      try {
        currentPermission = await Notification.requestPermission()
      } catch (_) {
        // ignore
      }
    }

    setPermission(currentPermission)

    setNotificationsEnabled(true)
    await startPolling()
  }

  function disableNotifications() {
    setNotificationsEnabled(false)
    stopPolling()
  }

  return {
    notificationsEnabled,
    enableNotifications,
    disableNotifications,
    newOrderCount,
  }
}

// Admin-specific notification hook
export function useAdminNotifications({ onNewOrder }: UseNotificationsOptions = {}) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const lastOrderIdsRef = useRef<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize audio for notification sound
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()
      audioRef.current.src = "/sounds/happy-bells-notification-937.wav"
      audioRef.current.preload = "auto"
      audioRef.current.volume = 0.8
    }
  }, [])

  // Request current permission on mount (browser only)
  useEffect(() => {
    if (typeof window === "undefined") return
    setPermission(Notification.permission)
  }, [])

  // Cleanup any polling when unmounting
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  async function startPolling() {
    if (pollingIntervalRef.current) return

    // Run immediately then at interval
    const poll = async () => {
      try {
        const response = await fetch("/api/admin/orders?status=PENDING")
        const data = await response.json()
        const orders: Order[] = data?.orders || []

        // Get current order IDs
        const currentOrderIds = new Set(orders.map(order => order.id))
        const lastOrderIds = lastOrderIdsRef.current

        // Find new orders
        const newOrders = orders.filter(order => !lastOrderIds.has(order.id))
        
        if (newOrders.length > 0) {
          setNewOrderCount((c) => c + newOrders.length)
          lastOrderIdsRef.current = currentOrderIds

          // Process each new order
          for (const order of newOrders) {
            // Play sound if possible
            try {
              if (audioRef.current && audioInitialized) {
                // Reset audio to beginning and play
                audioRef.current.currentTime = 0
                const playPromise = audioRef.current.play()
                if (playPromise !== undefined) {
                  playPromise.catch((error) => {
                    console.log("Audio play failed:", error)
                    // Try to initialize audio on next user interaction
                    if (!audioInitialized) {
                      document.addEventListener('click', () => {
                        initializeAudio().then(() => {
                          audioRef.current?.play().catch(() => {})
                        })
                      }, { once: true })
                    }
                  })
                }
              } else if (audioRef.current && !audioInitialized) {
                // Try to initialize and play
                initializeAudio().then((initialized) => {
                  if (initialized) {
                    audioRef.current?.play().catch(() => {})
                  }
                })
              }
            } catch (error) {
              console.log("Audio error:", error)
            }

            // Fire browser notification if permitted
            if (permission === "granted" && typeof window !== "undefined") {
              new Notification("New order received", {
                body: `#${order.orderNumber} - ${order.user.name}`,
                icon: "/placeholder-logo.svg"
              })
            }

            // Callback to consumer
            if (onNewOrder) {
              onNewOrder(order)
            }
          }
        } else {
          // Update the set of known order IDs
          lastOrderIdsRef.current = currentOrderIds
        }
      } catch (err) {
        // Swallow errors to keep polling resilient
      }
    }

    await poll()
    pollingIntervalRef.current = setInterval(poll, 5000) // Poll every 5 seconds for admin
  }

  function stopPolling() {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  async function enableNotifications() {
    if (typeof window === "undefined") return

    let currentPermission: NotificationPermission = Notification.permission
    if (currentPermission === "default") {
      try {
        currentPermission = await Notification.requestPermission()
      } catch (_) {
        // ignore
      }
    }

    setPermission(currentPermission)

    setNotificationsEnabled(true)
    await startPolling()
  }

  function disableNotifications() {
    setNotificationsEnabled(false)
    stopPolling()
  }

  // Function to initialize audio with user interaction
  const initializeAudio = async () => {
    if (audioRef.current && !audioInitialized) {
      try {
        await audioRef.current.play()
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        setAudioInitialized(true)
        return true
      } catch (error) {
        console.log("Audio initialization failed:", error)
        return false
      }
    }
    return audioInitialized
  }

  return {
    notificationsEnabled,
    enableNotifications,
    disableNotifications,
    newOrderCount,
    initializeAudio,
    audioInitialized,
  }
}
