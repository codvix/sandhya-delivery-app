"use client"

import { useState } from "react"
import { Bell, X, Check, Trash2 } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-500'
      case 'PREPARING': return 'bg-yellow-500'
      case 'OUT_FOR_DELIVERY': return 'bg-orange-500'
      case 'DELIVERED': return 'bg-green-500'
      case 'CANCELLED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmed'
      case 'PREPARING': return 'Preparing'
      case 'OUT_FOR_DELIVERY': return 'Out for Delivery'
      case 'DELIVERED': return 'Delivered'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <Card className="absolute right-0 top-12 w-80 max-h-96 z-50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="h-8 px-2 text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearNotifications}
                      className="h-8 px-2 text-xs text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div
                          className={cn(
                            "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                            !notification.read && "bg-blue-50 dark:bg-blue-950/20"
                          )}
                          onClick={() => {
                            markAsRead(notification.id)
                            setIsOpen(false)
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {notification.status && (
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  getStatusColor(notification.status)
                                )} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium truncate">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              
                              {notification.status && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs mb-2"
                                >
                                  {getStatusLabel(notification.status)}
                                </Badge>
                              )}
                              
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {index < notifications.length - 1 && (
                          <Separator className="mx-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
