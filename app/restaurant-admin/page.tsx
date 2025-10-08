"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/loading-spinner"
import { MenuItemManagement } from "@/components/menu-item-management"
import { CategoryManagement } from "@/components/category-management"
import { RestaurantSettings } from "@/components/restaurant-settings"
import { 
  Store, 
  Menu, 
  Package, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"

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
  gstNumber: string | null
}

interface Category {
  id: string
  name: string
  icon: string | null
  order: number
  menuItems: MenuItem[]
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

export default function RestaurantAdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (user?.role !== "RESTAURANT_OWNER") {
      router.push("/")
      return
    }
    fetchRestaurantData()
  }, [user, router])

  const fetchRestaurantData = async () => {
    try {
      // Get restaurant owned by this user
      const response = await fetch("/api/restaurants")
      if (response.ok) {
        const restaurants = await response.json()
        const userRestaurant = restaurants.find((r: any) => r.ownerId === user?.id)
        if (userRestaurant) {
          setRestaurant(userRestaurant)
          
          // Fetch menu items
          const menuResponse = await fetch(`/api/restaurants/${userRestaurant.id}/menu`)
          if (menuResponse.ok) {
            const menuData = await menuResponse.json()
            setCategories(menuData)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch restaurant data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (user?.role !== "RESTAURANT_OWNER") {
    return null
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle className="mb-2">No Restaurant Found</CardTitle>
              <CardDescription>
                You don't have a restaurant associated with your account. Please contact support.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your restaurant, menu items, and orders
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
          >
            Back to App
          </Button>
        </div>

        {/* Restaurant Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                <CardDescription>{restaurant.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
                  {restaurant.isOpen ? "Open" : "Closed"}
                </Badge>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating</p>
                <p className="text-lg font-semibold">{restaurant.rating} ⭐</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivery Time</p>
                <p className="text-lg font-semibold">{restaurant.deliveryTime}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost for Two</p>
                <p className="text-lg font-semibold">₹{restaurant.costForTwo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Menu className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Total Items</p>
                      <p className="text-2xl font-bold">
                        {categories.reduce((total, cat) => total + cat.menuItems.length, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Available Items</p>
                      <p className="text-2xl font-bold">
                        {categories.reduce((total, cat) => 
                          total + cat.menuItems.filter(item => item.isAvailable).length, 0
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Categories</p>
                      <p className="text-2xl font-bold">{categories.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-lg font-semibold">
                        {restaurant.isOpen ? "Open" : "Closed"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <MenuItemManagement restaurantId={restaurant.id} />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <RestaurantSettings 
              restaurant={restaurant} 
              onUpdate={fetchRestaurantData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
