"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminNotifications } from "@/contexts/admin-notification-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Package, User, Clock, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"

export function NewOrderPopup() {
  const { 
    showNewOrderPopup, 
    newOrderData, 
    closeNewOrderPopup, 
    markAsRead 
  } = useAdminNotifications()
  const router = useRouter()

  // Auto-close popup after 10 seconds
  useEffect(() => {
    if (showNewOrderPopup && newOrderData) {
      const timer = setTimeout(() => {
        closeNewOrderPopup()
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [showNewOrderPopup, newOrderData, closeNewOrderPopup])

  const handleViewOrder = () => {
    if (newOrderData?.orderId) {
      markAsRead(newOrderData.id)
      closeNewOrderPopup()
      router.push(`/admin?tab=overview&order=${newOrderData.orderId}`)
    }
  }

  const handleClose = () => {
    if (newOrderData) {
      markAsRead(newOrderData.id)
    }
    closeNewOrderPopup()
  }

  if (!showNewOrderPopup || !newOrderData) {
    return null
  }

  return (
    <Dialog open={showNewOrderPopup} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">New Order Alert!</DialogTitle>
              <DialogDescription>
                A new order has been placed and requires your attention
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Order #{newOrderData.orderNumber}
              </CardTitle>
              <Badge variant="outline">
                {newOrderData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {newOrderData.customerName && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Customer:</span>
                <span>{newOrderData.customerName}</span>
              </div>
            )}
            
            {newOrderData.restaurantName && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Restaurant:</span>
                <span>{newOrderData.restaurantName}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time:</span>
              <span>{new Date(newOrderData.createdAt).toLocaleTimeString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleViewOrder} className="flex-1">
            View Order Details
          </Button>
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
