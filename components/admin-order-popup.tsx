"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Eye, User, Phone } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { formatDistanceToNow } from "date-fns"

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

interface AdminOrderPopupProps {
  order: Order
  onClose: () => void
  onViewOrder: (orderId: string) => void
}

export function AdminOrderPopup({ order, onClose, onViewOrder }: AdminOrderPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Play notification sound when popup appears
    const playSound = async () => {
      try {
        const audio = new Audio('/sounds/happy-bells-notification-937.wav')
        audio.volume = 0.8
        audio.preload = "auto"
        
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Popup audio play failed:", error)
            // Try to play with user interaction fallback
            document.addEventListener('click', () => {
              audio.play().catch(() => {})
            }, { once: true })
          })
        }
      } catch (error) {
        console.log("Popup audio error:", error)
      }
    }

    playSound()

    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleViewOrder = () => {
    onViewOrder(order.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card 
        className={`w-full max-w-md transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <CardTitle className="text-lg text-green-600">New Order Received! 🎉</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Order Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Order #{order.orderNumber}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Badge variant="outline" className="bg-green-500 text-white border-0">
              New Order
            </Badge>
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.user.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.user.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Restaurant:</span>
              <span className="font-medium">{order.restaurant.name}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleViewOrder}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Order
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
