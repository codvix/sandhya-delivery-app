"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useAuth } from "./auth-context"

interface Notification {
  id: string
  type: 'order_status' | 'order_created' | 'order_delivered'
  title: string
  message: string
  orderId?: string
  orderNumber?: string
  status?: string
  read: boolean
  createdAt: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()
  const lastOrderStatusesRef = useRef<Record<string, string>>({})

  const unreadCount = notifications.filter(n => !n.read).length

  // Load notifications and last order statuses from localStorage on mount
  useEffect(() => {
    if (user) {
      // Load notifications
      const stored = localStorage.getItem(`notifications_${user.id}`)
      if (stored) {
        try {
          setNotifications(JSON.parse(stored))
        } catch (error) {
          console.error('Failed to parse stored notifications:', error)
        }
      }

      // Load last order statuses to prevent duplicate notifications
      const storedStatuses = localStorage.getItem(`lastOrderStatuses_${user.id}`)
      if (storedStatuses) {
        try {
          lastOrderStatusesRef.current = JSON.parse(storedStatuses)
        } catch (error) {
          console.error('Failed to parse stored order statuses:', error)
        }
      }
    }
  }, [user])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications))
    }
  }, [notifications, user])

  // Save last order statuses to localStorage whenever they change
  useEffect(() => {
    if (user && Object.keys(lastOrderStatusesRef.current).length > 0) {
      localStorage.setItem(`lastOrderStatuses_${user.id}`, JSON.stringify(lastOrderStatusesRef.current))
    }
  }, [user])

  // Poll for order status updates
  useEffect(() => {
    if (!user) return

    const pollOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const data = await response.json()
          const orders = data.orders || []
          
          // Check for status changes and create notifications
          orders.forEach((order: any) => {
            const lastStatus = lastOrderStatusesRef.current[order.id]
            
            // Only create notification if status changed
            if (lastStatus !== order.status) {
              const statusMessages = {
                'CONFIRMED': 'Your order has been confirmed and is being prepared',
                'PREPARING': 'Your order is being prepared by the restaurant',
                'OUT_FOR_DELIVERY': 'Your order is out for delivery',
                'DELIVERED': 'Your order has been delivered!',
                'CANCELLED': 'Your order has been cancelled'
              }
              
              const message = statusMessages[order.status as keyof typeof statusMessages]
              if (message) {
                addNotification({
                  type: 'order_status',
                  title: `Order #${order.orderNumber} Update`,
                  message,
                  orderId: order.id,
                  orderNumber: order.orderNumber,
                  status: order.status,
                  read: false
                })
              }
              
              // Update the last known status
              lastOrderStatusesRef.current[order.id] = order.status
            }
          })
        }
      } catch (error) {
        console.error('Failed to poll orders:', error)
      }
    }

    // Poll every 30 seconds
    const interval = setInterval(pollOrders, 30000)
    
    // Initial poll
    pollOrders()

    return () => clearInterval(interval)
  }, [user])

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    // Check for duplicate notifications based on orderId and status
    const isDuplicate = notifications.some(n => 
      n.orderId === notification.orderId && 
      n.status === notification.status &&
      n.type === notification.type
    )

    if (isDuplicate) {
      console.log('Duplicate notification prevented:', notification)
      return
    }

    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString()
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Play notification sound
    try {
      const audio = new Audio('/sounds/happy-bells-notification-937.wav')
      audio.volume = 0.8
      audio.play().catch(() => {}) // Ignore autoplay errors
    } catch (error) {
      // Ignore audio errors
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
    if (user) {
      localStorage.removeItem(`notifications_${user.id}`)
      localStorage.removeItem(`lastOrderStatuses_${user.id}`)
    }
  }

  // Clean up old notifications (keep only last 50)
  const cleanupOldNotifications = () => {
    setNotifications(prev => {
      if (prev.length > 50) {
        // Keep only the 50 most recent notifications
        const sorted = prev.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        return sorted.slice(0, 50)
      }
      return prev
    })
  }

  // Clean up old notifications when they exceed 50
  useEffect(() => {
    if (notifications.length > 50) {
      cleanupOldNotifications()
    }
  }, [notifications.length])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
