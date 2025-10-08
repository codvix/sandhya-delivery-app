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

  // Load notifications from database on mount
  useEffect(() => {
    if (user) {
      loadNotifications()
      
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

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

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
            
            // Only create notification if status changed and it's not the initial load
            if (lastStatus !== order.status && lastStatus !== undefined) {
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
            }
            
            // Update the last known status
            lastOrderStatusesRef.current[order.id] = order.status
          })
        }
      } catch (error) {
        console.error('Failed to poll orders:', error)
      }
    }

    // Poll every 30 seconds
    const interval = setInterval(pollOrders, 30000)
    
    // Initial poll (this will set the baseline statuses without creating notifications)
    pollOrders()

    return () => clearInterval(interval)
  }, [user])

  const addNotification = async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
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

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification)
      })

      if (response.ok) {
        const newNotification = await response.json()
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
    } catch (error) {
      console.error('Failed to add notification:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          read: true
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          read: true
        })
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const clearNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications([])
        if (user) {
          localStorage.removeItem(`lastOrderStatuses_${user.id}`)
        }
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  }


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
