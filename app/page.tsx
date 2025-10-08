"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { SearchBar } from "@/components/search-bar"
import { MenuItemCard } from "@/components/menu-item-card"
import { BottomNav } from "@/components/bottom-nav"
import { LoadingSpinner } from "@/components/loading-spinner"
import { BannerCarousel } from "@/components/banner-carousel"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Star, Utensils, ChefHat } from "lucide-react"
import Image from "next/image"

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  isPopular: boolean
  isVegetarian: boolean
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

interface Restaurant {
  id: string
  name: string
  description: string | null
  image: string | null
  rating: number
  totalRatings: number
  deliveryTime: string
  costForTwo: number
  cuisines: string | null
  isOpen: boolean
  address: string
}

interface Banner {
  id: string
  title: string
  description: string | null
  image: string
  link: string | null
}

export default function HomePage() {
  const { user, loading: isLoading } = useAuth()
  const { addToCart, removeItem, items } = useCart()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    // Redirect admin users to admin dashboard
    if (user && user.role === "ADMIN") {
      router.push("/admin")
      return
    }

    // Redirect restaurant owners to restaurant admin
    if (user && user.role === "RESTAURANT_OWNER") {
      router.push("/restaurant-admin")
      return
    }

    if (user && user.role === "USER") {
      fetchRestaurantAndMenu()
    }
  }, [user, isLoading, router])

  const fetchRestaurantAndMenu = async () => {
    try {
      // Fetch banners
      const bannersResponse = await fetch("/api/banners")
      if (bannersResponse.ok) {
        const bannersData = await bannersResponse.json()
        setBanners(bannersData)
      }

      // First get the first available restaurant
      const restaurantsResponse = await fetch("/api/restaurants")
      if (restaurantsResponse.ok) {
        const restaurantsData = await restaurantsResponse.json()
        if (restaurantsData.length > 0) {
          const firstRestaurant = restaurantsData[0]
          setRestaurant(firstRestaurant)
          
          // Then get all menu items for this restaurant
          const menuResponse = await fetch(`/api/restaurants/${firstRestaurant.id}/menu`)
          if (menuResponse.ok) {
            const menuData = await menuResponse.json()
            setCategories(menuData)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch restaurant and menu:", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get item quantity from cart
  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find(item => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  // Filter menu items based on search query
  const filteredCategories = categories.map(category => ({
    ...category,
    menuItems: category.menuItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.menuItems.length > 0)

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Don't render the home page for admin or restaurant owner users
  if (user.role === "ADMIN" || user.role === "RESTAURANT_OWNER") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Good morning!</h1>
              <p className="text-muted-foreground">What would you like to eat?</p>
            </div>
            <NotificationBell />
          </div>
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search menu items..."
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        {/* Banner Carousel */}
        {banners.length > 0 && (
          <div className="mb-6">
            <BannerCarousel banners={banners} />
          </div>
        )}

       

        {/* Menu Items by Category */}
        <div className="space-y-6">
          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="mb-2">No menu items found</CardTitle>
                <CardDescription>
                  Try adjusting your search or check back later for new items.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <Badge variant="secondary">
                    {category.menuItems.length} items
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {category.menuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description || ""}
                      price={item.price}
                      image={item.image}
                      isVeg={item.isVegetarian}
                      isAvailable={true}
                      isPopular={item.isPopular}
                      quantity={getItemQuantity(item.id)}
                      onAdd={() => addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        restaurantId: restaurant?.id || "",
                        restaurantName: restaurant?.name || ""
                      })}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
