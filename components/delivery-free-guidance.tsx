"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, Plus, ShoppingBag } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { calculateDeliveryFee } from "@/lib/utils/distance"
import Link from "next/link"

interface DeliveryFreeGuidanceProps {
  subtotal: number
  deliveryFee: number
  restaurantId: string
  deliveryDistance?: number
}

const FREE_DELIVERY_THRESHOLD = 19900 // ₹199 in cents

export function DeliveryFreeGuidance({ subtotal, deliveryFee, restaurantId, deliveryDistance }: DeliveryFreeGuidanceProps) {
  // Calculate what the delivery fee would be without free delivery logic
  const baseDeliveryFee = deliveryDistance ? calculateDeliveryFee(deliveryDistance, subtotal) : 1000 // ₹10 base fee
  
  const amountNeeded = FREE_DELIVERY_THRESHOLD - subtotal
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD
  const amountNeededInRupees = Math.round(amountNeeded / 100)
  
  
  // Don't show the component if subtotal is 0 or negative
  if (subtotal <= 0) {
    return null
  }

  if (isFreeDelivery) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  🎉 Free Delivery!
                </h3>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  You saved {formatCurrency(baseDeliveryFee)}
                </Badge>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Your order qualifies for free delivery
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
            <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">
              Add ₹{amountNeededInRupees} more for free delivery!
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              You're paying {formatCurrency(baseDeliveryFee)} delivery fee
            </p>
            <div className="mt-3">
              <Link href={`/restaurant/${restaurantId}`}>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  Add More Items
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400 mb-1">
            <span>Order value</span>
            <span>{formatCurrency(subtotal)} / {formatCurrency(FREE_DELIVERY_THRESHOLD)}</span>
          </div>
          <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
