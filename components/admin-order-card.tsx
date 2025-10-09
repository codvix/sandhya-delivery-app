"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getOrderStatusColor, getOrderStatusLabel } from "@/lib/utils/order"
import { formatCurrency } from "@/lib/utils/currency"
import { Phone, MapPin, Eye, Package, User, Calendar, CreditCard } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  isVeg?: boolean
}

interface AdminOrderCardProps {
  id: string
  orderNumber: string
  user: {
    name: string
    phone: string
  }
  restaurant: {
    name: string
    image: string
  }
  address: {
    street: string
    city: string
  }
  status: string
  subtotal: number
  deliveryFee: number
  tax: number
  tip: number
  discount: number
  total: number
  createdAt: string
  items: OrderItem[]
  coupon?: {
    id: string
    code: string
    name: string
    type: string
    value: number
  } | null
  onStatusChange: (orderId: string, newStatus: string) => void
  onDeliveryLevelChange?: (orderId: string, newLevel: string) => void
  onGenerateInvoice?: (orderId: string) => void
}

export function AdminOrderCard({
  id,
  orderNumber,
  user,
  restaurant,
  address,
  status,
  subtotal,
  deliveryFee,
  tax,
  tip,
  discount,
  total,
  createdAt,
  items,
  coupon,
  onStatusChange,
  onDeliveryLevelChange,
  onGenerateInvoice,
}: AdminOrderCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const itemCount = items?.length ?? 0

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{restaurant.name}</h3>
                <p className="text-xs text-muted-foreground">#{orderNumber}</p>
              </div>
            </div>
            <Badge className={`text-xs ${getOrderStatusColor(status)}`}>{getOrderStatusLabel(status)}</Badge>
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground line-clamp-2">
                {address.street}, {address.city}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm">
              <span className="text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
              <span className="mx-2">•</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                  <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg">Order Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Package className="h-4 w-4" />
                            <span>Order Number</span>
                          </div>
                          <p className="font-semibold">#{orderNumber}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Calendar className="h-4 w-4" />
                            <span>Order Date</span>
                          </div>
                          <p className="font-semibold text-sm">{new Date(createdAt).toLocaleString('en-US', {
                            hour12: true,
                          })}</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-4 w-4" />
                          <span>Customer Information</span>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </p>
                          <p className="text-xs flex items-start gap-2">
                            <MapPin className="h-3 w-3 mt-0.5" />
                            <span>{address.street}, {address.city}</span>
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-3 text-sm">Order Items</h3>
                        <div className="space-y-2">
                          {items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                              {item.image && (
                                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">{item.name}</p>
                                  {item.isVeg !== undefined && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {item.isVeg ? 'VEG' : 'NON-VEG'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <CreditCard className="h-4 w-4" />
                          <span>Payment Summary</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Delivery Fee</span>
                            <span>{formatCurrency(deliveryFee)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span>{formatCurrency(tax)}</span>
                          </div>
                          {tip > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Tip</span>
                              <span>{formatCurrency(tip)}</span>
                            </div>
                          )}
                          {discount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Discount{coupon ? ` (${coupon.code})` : ''}
                              </span>
                              <span className="text-green-600">-{formatCurrency(discount)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Badge className={`text-xs ${getOrderStatusColor(status)}`} variant="outline">
                          {getOrderStatusLabel(status)}
                        </Badge>
                        <p className="text-xs text-muted-foreground truncate">{restaurant.name}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <p className="text-xs text-muted-foreground">{new Date(createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Status Update */}
            {status !== "DELIVERED" && status !== "CANCELLED" && (
              <div className="space-y-2">
                <Select value={status} onValueChange={(newStatus) => onStatusChange(id, newStatus)}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PREPARING">Preparing</SelectItem>
                    <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Additional Actions */}
            <div className="flex gap-2">
              {onDeliveryLevelChange && (
                <Select onValueChange={(lvl) => onDeliveryLevelChange(id, lvl)}>
                  <SelectTrigger className="flex-1 h-9 text-sm">
                    <SelectValue placeholder="Delivery Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="EXPRESS">Express</SelectItem>
                    <SelectItem value="PRIORITY">Priority</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {onGenerateInvoice && (
                <Button variant="outline" size="sm" className="h-9 px-3 text-sm" onClick={() => onGenerateInvoice(id)}>
                  Invoice
                </Button>
              )}
            </div>
          </div>
      </CardContent>
    </Card>
  )
}
