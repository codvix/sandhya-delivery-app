"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useAuth } from "./auth-context"
import { AdminOrderPopup } from "@/components/admin-order-popup"

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

interface AdminNotification {
  id: string
  type: 'new_order' | 'order_status_change'
  title: string
  message: string
  orderId?: string
  orderNumber?: string
  status?: string
  read: boolean
  createdAt: string
  order?: Order
}

interface AdminNotificationContextType {
  notifications: AdminNotification[]
  unreadCount: number
  showOrderPopup: (order: Order) => void
  hideOrderPopup: () => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  addNotification: (notification: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>) => void
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined)

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const { user } = useAuth()
  const lastOrderIdsRef = useRef<Set<string>>(new Set())

  const unreadCount = notifications.filter(n => !n.read).length

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`admin_notifications_${user.id}`)
      if (stored) {
        try {
          setNotifications(JSON.parse(stored))
        } catch (error) {
          console.error('Failed to parse stored admin notifications:', error)
        }
      }

      // Load last order IDs to prevent duplicate notifications
      const storedOrderIds = localStorage.getItem(`admin_lastOrderIds_${user.id}`)
      if (storedOrderIds) {
        try {
          lastOrderIdsRef.current = new Set(JSON.parse(storedOrderIds))
        } catch (error) {
          console.error('Failed to parse stored order IDs:', error)
        }
      }
    }
  }, [user])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`admin_notifications_${user.id}`, JSON.stringify(notifications))
    }
  }, [notifications, user])

  // Save last order IDs to localStorage whenever they change
  useEffect(() => {
    if (user && lastOrderIdsRef.current.size > 0) {
      localStorage.setItem(`admin_lastOrderIds_${user.id}`, JSON.stringify(Array.from(lastOrderIdsRef.current)))
    }
  }, [user])

  const addNotification = (notification: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>) => {
    // Check for duplicate notifications
    const isDuplicate = notifications.some(n => 
      n.orderId === notification.orderId && 
      n.type === notification.type
    )

    if (isDuplicate) {
      console.log('Duplicate admin notification prevented:', notification)
      return
    }

    const newNotification: AdminNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString()
    }
    
    setNotifications(prev => [newNotification, ...prev])
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
      localStorage.removeItem(`admin_notifications_${user.id}`)
      localStorage.removeItem(`admin_lastOrderIds_${user.id}`)
    }
  }

  // Clean up old notifications (keep only last 50)
  useEffect(() => {
    if (notifications.length > 50) {
      setNotifications(prev => {
        const sorted = prev.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        return sorted.slice(0, 50)
      })
    }
  }, [notifications.length])

  const showOrderPopup = (order: Order) => {
    setCurrentOrder(order)
    setIsPopupVisible(true)
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
      hideOrderPopup()
    }, 15000)
  }

  const hideOrderPopup = () => {
    setIsPopupVisible(false)
    setCurrentOrder(null)
  }

  const handleViewOrder = (orderId: string) => {
    // Mark related notifications as read
    setNotifications(prev => 
      prev.map(n => 
        n.orderId === orderId ? { ...n, read: true } : n
      )
    )
    hideOrderPopup()
  }

  return (
    <AdminNotificationContext.Provider value={{
      notifications,
      unreadCount,
      showOrderPopup,
      hideOrderPopup,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      addNotification
    }}>
      {children}
      
      {/* Render popup if visible */}
      {isPopupVisible && currentOrder && (
        <AdminOrderPopup
          order={currentOrder}
          onClose={hideOrderPopup}
          onViewOrder={handleViewOrder}
        />
      )}
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
