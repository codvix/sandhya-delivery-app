// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BottomNav } from "@/components/bottom-nav"
import { LoadingSpinner } from "@/components/loading-spinner"
import { MenuItemCard } from "@/components/menu-item-card"
import { NotificationBell } from "@/components/notification-bell"
import { 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  ArrowLeft, 
  ShoppingBag,
  Utensils,
  DollarSign
} from "lucide-react"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils/currency"

interface Restaurant {
  id: string
  name: string
  description: string | null
  image: string | null
  coverImage: string | null
  rating: number
  totalRatings: number
  deliveryTime: string
  costForTwo: number
  cuisines: string | null
  isOpen: boolean
  address: string
  phone: string | null
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string | null
  isVeg: boolean
  isAvailable: boolean
  isPopular: boolean
  category: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  menuItems: MenuItem[]
}

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart, getTotalItems } = useCart()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const restaurantId = params.id as string
  const totalItems = getTotalItems()

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantDetails()
    }
  }, [restaurantId])

  const fetchRestaurantDetails = async () => {
    try {
      const [restaurantResponse, menuResponse] = await Promise.all([
        fetch(`/api/restaurants/${restaurantId}`),
        fetch(`/api/restaurants/${restaurantId}/menu`)
      ])

      if (restaurantResponse.ok && menuResponse.ok) {
        const restaurantData = await restaurantResponse.json()
        const menuData = await menuResponse.json()
        
        setRestaurant(restaurantData)
        setCategories(menuData)
        
        if (menuData.length > 0) {
          setSelectedCategory(menuData[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch restaurant details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (menuItem: MenuItem) => {
    if (!restaurant) return
    
    addToCart({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      quantity: 1
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">Restaurant not found</CardTitle>
            <CardDescription className="mb-4">
              The restaurant you're looking for doesn't exist.
            </CardDescription>
            <Button onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
  const availableMenuItems = selectedCategoryData?.menuItems.filter(item => item.isAvailable) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold truncate flex-1 mx-4">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/cart")}
                className="relative"
              >
                <ShoppingBag className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Restaurant Info */}
        <Card className="mb-6">
          <div className="relative h-48 w-full">
            {restaurant.coverImage ? (
              <Image
                src={restaurant.coverImage}
                alt={restaurant.name}
                fill
                className="object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-t-lg flex items-center justify-center">
                <Utensils className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 rounded-t-lg" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl font-bold text-white mb-2">{restaurant.name}</h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{restaurant.rating}</span>
                  <span className="text-sm">({restaurant.totalRatings})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">{formatCurrency(restaurant.costForTwo)} for two</span>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="space-y-3">
              {restaurant.description && (
                <p className="text-muted-foreground">{restaurant.description}</p>
              )}
              
              {restaurant.cuisines && (
                <div className="flex flex-wrap gap-2">
                  {restaurant.cuisines.split(",").map((cuisine, index) => (
                    <Badge key={index} variant="secondary">
                      {cuisine.trim()}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
                {restaurant.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant={restaurant.isOpen ? "default" : "destructive"}>
                  {restaurant.isOpen ? "Open" : "Closed"}
                </Badge>
                <Button
                  onClick={() => router.push("/cart")}
                  disabled={totalItems === 0}
                >
                  View Cart ({totalItems})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Menu Categories</h2>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items */}
        {selectedCategoryData && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{selectedCategoryData.name}</h3>
            
            {availableMenuItems.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <CardTitle className="mb-2">No items available</CardTitle>
                  <CardDescription>
                    This category doesn't have any available items right now.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {availableMenuItems.map((menuItem) => (
                  <MenuItemCard
                    key={menuItem.id}
                    menuItem={menuItem}
                    onAddToCart={() => handleAddToCart(menuItem)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

