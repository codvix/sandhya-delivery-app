"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, MapPin, Clock, Star } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"

interface ItemCardProps {
  id: string
  name: string
  description: string
  price: number
  image?: string
  isVeg: boolean
  isPopular: boolean
  restaurant: {
    id: string
    name: string
    address: string
    deliveryTime: string
    rating: number
    totalRatings: number
    cuisines: string
  }
  category: {
    name: string
  }
  onAddToCart?: (itemId: string, restaurantId: string) => void
}

export function ItemCard({
  id,
  name,
  description,
  price,
  image,
  isVeg,
  isPopular,
  restaurant,
  category,
  onAddToCart
}: ItemCardProps) {
  const { addToCart, removeFromCart, getItemQuantity } = useCart()
  const router = useRouter()
  const quantity = getItemQuantity(id, restaurant.id)

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(id, restaurant.id)
    }
    addToCart(id, restaurant.id)
  }

  const handleRemoveFromCart = () => {
    removeFromCart(id, restaurant.id)
  }

  const handleViewRestaurant = () => {
    router.push(`/restaurant/${restaurant.id}`)
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="relative w-full h-48">
          <Image
            src={image || "/placeholder.jpg"}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            loading="lazy"
          />
          {isPopular && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
              Popular
            </Badge>
          )}
          {isVeg && (
            <Badge variant="secondary" className="absolute top-2 right-2 bg-green-100 text-green-800">
              Veg
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {category.name}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-primary">
              {formatCurrency(price)}
            </div>
            
            {quantity > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRemoveFromCart}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[20px] text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleAddToCart}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleAddToCart} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{restaurant.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{restaurant.deliveryTime}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">
                  {restaurant.rating.toFixed(1)} ({restaurant.totalRatings})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleViewRestaurant}
              >
                View Menu
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
