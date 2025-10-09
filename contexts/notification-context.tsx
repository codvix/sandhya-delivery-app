// @ts-nocheck
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useAuth } from "./auth-context"
import { playNotificationSound } from "@/lib/audio"

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

  // Poll for new notifications (more efficient than polling orders)
  useEffect(() => {
    if (!user) return

    const pollNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')
        if (response.ok) {
          const data = await response.json()
          const newNotifications = data || []
          
          // Check for new notifications and play sound
          const previousNotificationIds = new Set(notifications.map(n => n.id))
          const newNotificationIds = new Set(newNotifications.map((n: any) => n.id))
          
          // Find notifications that are new (not in previous set)
          const trulyNewNotifications = newNotifications.filter((n: any) => 
            !previousNotificationIds.has(n.id)
          )
          
          // Play sound for new notifications
          if (trulyNewNotifications.length > 0) {
            playNotificationSound()
          }
          
          // Update notifications state
          setNotifications(newNotifications)
        }
      } catch (error) {
        console.error('Failed to poll notifications:', error)
      }
    }

    // Poll every 10 seconds for new notifications (more frequent than before)
    const interval = setInterval(pollNotifications, 10000)
    
    // Initial poll
    pollNotifications()

    return () => clearInterval(interval)
  }, [user, notifications])

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
        playNotificationSound()
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
