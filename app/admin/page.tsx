"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AdminOrderCard } from "@/components/admin-order-card"
import { AdminOrderPopup } from "@/components/admin-order-popup"
import { UserStats } from "@/components/user-stats"
import { MenuItemManagement } from "@/components/menu-item-management"
import { CategoryManagement } from "@/components/category-management"
import { RestaurantSettings } from "@/components/restaurant-settings"
import { CouponManagement } from "@/components/coupon-management"
import { AdminNotificationBell } from "@/components/admin-notification-bell"
import { NewOrderPopup } from "@/components/new-order-popup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/loading-spinner"
import { 
  Bell, 
  Package, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image,
  Settings,
  Activity,
  Store,
  Menu,
  Tag
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"

interface Order {
  id: string
  orderNumber: string
  user: {
    id: string
    name: string
    phone: string
  }
  restaurant: {
    id: string
    name: string
    image: string | null
  }
  address: {
    id: string
    label: string
    street: string
    city: string
    state: string
    zipCode: string
  }
  status: string
  subtotal: number
  deliveryFee: number
  tax: number
  tip: number
  discount: number
  total: number
  createdAt: string
  items: Array<{
    id: string
    price: number
    quantity: number
    menuItem: {
      name: string
      image: string | null
      isVeg: boolean
    }
  }>
  coupon?: {
    id: string
    code: string
    name: string
    type: string
    value: number
  } | null
}

interface Stats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  averageOrderValue: number
}

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
  owner: {
    id: string
    name: string
    phone: string
  }
  _count: {
    menuItems: number
    orders: number
  }
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Only redirect if user is loaded and not admin
    if (user && user.role !== "ADMIN") {
      router.push("/")
      return
    }

    // Only fetch data if user is admin
    if (user?.role === "ADMIN") {
      fetchOrders()
      fetchStats()
      fetchRestaurants()
    }
  }, [user, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchRestaurants = async () => {
    try {
      const response = await fetch("/api/admin/restaurants")
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data)
        if (data.length > 0) {
          setSelectedRestaurant(data[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh orders
        fetchOrders()
        setSelectedOrder(null)
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true
    if (filter === "pending") {
      return ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status)
    }
    if (filter === "completed") {
      return ["DELIVERED", "CANCELLED"].includes(order.status)
    }
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "CONFIRMED":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "PREPARING":
        return <Package className="h-4 w-4 text-orange-500" />
      case "OUT_FOR_DELIVERY":
        return <Package className="h-4 w-4 text-purple-500" />
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "PREPARING":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Show loading while user is being loaded or data is being fetched
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // If user is loaded but not admin, don't render anything (redirect will happen)
  if (user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage orders and monitor restaurant performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <AdminNotificationBell />
            <Button
              variant="outline"
              onClick={() => router.push("/admin/banners")}
            >
              <Image className="h-4 w-4 mr-2" />
              Manage Banners
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/performance")}
            >
              <Activity className="h-4 w-4 mr-2" />
              Performance
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
            >
              Back to App
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Pending Orders</p>
                    <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Completed Orders</p>
                    <p className="text-2xl font-bold">{stats.completedOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <Package className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="restaurants">
              <Store className="h-4 w-4 mr-2" />
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="menu-items">
              <Menu className="h-4 w-4 mr-2" />
              Menu Items
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Tag className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="coupons">
              <Tag className="h-4 w-4 mr-2" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Orders Management */}
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">
                  All Orders
                  <Badge variant="secondary" className="ml-2">
                    {orders.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  <Badge variant="secondary" className="ml-2">
                    {orders.filter(o => ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(o.status)).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  <Badge variant="secondary" className="ml-2">
                    {orders.filter(o => ["DELIVERED", "CANCELLED"].includes(o.status)).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="mt-6">
                {filteredOrders.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <CardTitle className="mb-2">No orders found</CardTitle>
                      <CardDescription>
                        {filter === "all" 
                          ? "No orders have been placed yet."
                          : `No ${filter} orders found.`
                        }
                      </CardDescription>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                    <AdminOrderCard
                      key={order.id}
                      id={order.id}
                      orderNumber={order.orderNumber}
                      user={order.user}
                      restaurant={{
                        name: order.restaurant.name,
                        image: order.restaurant.image || "/placeholder.svg"
                      }}
                      address={{
                        street: order.address.street,
                        city: order.address.city
                      }}
                      status={order.status}
                      subtotal={order.subtotal}
                      deliveryFee={order.deliveryFee}
                      tax={order.tax}
                      tip={order.tip}
                      discount={order.discount}
                      total={order.total}
                      createdAt={order.createdAt}
                      items={order.items.map((item) => ({
                        id: item.id,
                        name: item.menuItem.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.menuItem.image || undefined,
                        isVeg: item.menuItem.isVeg
                      }))}
                      coupon={order.coupon}
                      onStatusChange={handleStatusUpdate}
                    />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="restaurants" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Restaurants</h3>
                <Badge variant="outline">
                  {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {restaurants.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <CardTitle className="mb-2">No restaurants found</CardTitle>
                    <CardDescription>
                      No restaurants have been registered yet.
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurants.map((restaurant) => (
                    <Card key={restaurant.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                          <Badge variant={restaurant.isOpen ? "default" : "secondary"}>
                            {restaurant.isOpen ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <CardDescription>
                          Owner: {restaurant.owner.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Menu Items:</span>
                            <span className="font-medium">{restaurant._count.menuItems}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Total Orders:</span>
                            <span className="font-medium">{restaurant._count.orders}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Rating:</span>
                            <span className="font-medium">{restaurant.rating.toFixed(1)} ⭐</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Cost for Two:</span>
                            <span className="font-medium">₹{restaurant.costForTwo / 100}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="menu-items" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Menu Items Management</h3>
                {restaurants.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="restaurant-select">Select Restaurant:</Label>
                    <select
                      id="restaurant-select"
                      value={selectedRestaurant?.id || ""}
                      onChange={(e) => {
                        const restaurant = restaurants.find(r => r.id === e.target.value)
                        setSelectedRestaurant(restaurant || null)
                      }}
                      className="px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="">Choose a restaurant...</option>
                      {restaurants.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              {selectedRestaurant ? (
                <MenuItemManagement restaurantId={selectedRestaurant.id} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Menu className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <CardTitle className="mb-2">No restaurant selected</CardTitle>
                    <CardDescription>
                      Please select a restaurant to manage menu items.
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="coupons" className="mt-6">
            <CouponManagement />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Restaurant Settings</h3>
                {restaurants.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="settings-restaurant-select">Select Restaurant:</Label>
                    <select
                      id="settings-restaurant-select"
                      value={selectedRestaurant?.id || ""}
                      onChange={(e) => {
                        const restaurant = restaurants.find(r => r.id === e.target.value)
                        setSelectedRestaurant(restaurant || null)
                      }}
                      className="px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="">Choose a restaurant...</option>
                      {restaurants.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              {selectedRestaurant ? (
                <RestaurantSettings 
                  restaurant={selectedRestaurant} 
                  onUpdate={() => {
                    fetchRestaurants()
                  }} 
                />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <CardTitle className="mb-2">No restaurant selected</CardTitle>
                    <CardDescription>
                      Please select a restaurant to manage settings.
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* User Stats */}
        <div className="mt-8">
          <UserStats userId={user.id} />
        </div>
      </div>

      {/* Order Details Popup */}
      {selectedOrder && (
        <AdminOrderPopup
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onViewOrder={(orderId) => {
            // Handle view order action
            console.log("View order:", orderId)
          }}
        />
      )}

      {/* New Order Popup */}
      <NewOrderPopup />
    </div>
  )
}
