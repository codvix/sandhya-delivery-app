"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useAuth } from "./auth-context"

interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  orderId?: string
  orderNumber?: string
  status?: string
  read: boolean
  createdAt: string
  restaurantName?: string
  customerName?: string
}

interface AdminNotificationContextType {
  notifications: AdminNotification[]
  unreadCount: number
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>) => void
  clearNotifications: () => void
  showNewOrderPopup: boolean
  newOrderData: AdminNotification | null
  closeNewOrderPopup: () => void
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined)

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false)
  const [newOrderData, setNewOrderData] = useState<AdminNotification | null>(null)
  const { user } = useAuth()
  const lastOrderIdsRef = useRef<Set<string>>(new Set())

  const unreadCount = notifications.filter(n => !n.read).length

  // Load notifications from database on mount
  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        
        // Populate the lastOrderIdsRef with existing order IDs to prevent duplicates
        data.forEach((notification: AdminNotification) => {
          if (notification.orderId) {
            lastOrderIdsRef.current.add(notification.orderId)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  // Poll for new orders (admin only)
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return

    const pollOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders')
        if (response.ok) {
          const orders = await response.json()
          
          // Check for new orders by comparing with existing notifications
          for (const order of orders) {
            // Check if we already have a notification for this order
            const existingNotification = notifications.find(n => n.orderId === order.id)
            
            if (!existingNotification && !lastOrderIdsRef.current.has(order.id)) {
              // This is a new order - create notification in database
              try {
                const notificationResponse = await fetch('/api/admin/notifications', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    type: 'new_order',
                    title: 'New Order Received!',
                    message: `Order #${order.orderNumber} from ${order.user.name}`,
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    restaurantName: order.restaurant.name,
                    customerName: order.user.name
                  })
                })

                if (notificationResponse.ok) {
                  const newNotification = await notificationResponse.json()
                  setNotifications(prev => [newNotification, ...prev])
                  setNewOrderData(newNotification)
                  setShowNewOrderPopup(true)
                  
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
                console.error('Failed to create notification:', error)
              }

              // Add to known orders
              lastOrderIdsRef.current.add(order.id)
            }
          }
        }
      } catch (error) {
        console.error('Failed to poll admin orders:', error)
      }
    }

    // Poll every 10 seconds for admin (more frequent than customer)
    const interval = setInterval(pollOrders, 10000)
    
    // Initial poll
    pollOrders()

    return () => clearInterval(interval)
  }, [user, notifications])

  const addNotification = async (notification: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/admin/notifications', {
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
      const response = await fetch('/api/admin/notifications', {
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
      const response = await fetch('/api/admin/notifications', {
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
      const response = await fetch('/api/admin/notifications', {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications([])
        // Clear the in-memory order IDs as well
        lastOrderIdsRef.current.clear()
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  }

  const closeNewOrderPopup = () => {
    setShowNewOrderPopup(false)
    setNewOrderData(null)
  }

  return (
    <AdminNotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      clearNotifications,
      showNewOrderPopup,
      newOrderData,
      closeNewOrderPopup
    }}>
      {children}
    </AdminNotificationContext.Provider>
  )
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationContext)
  if (context === undefined) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider')
  }
  return context
}
