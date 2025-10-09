// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { OrderCard } from "@/components/order-card"
import { BottomNav } from "@/components/bottom-nav"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, Clock, CheckCircle, XCircle } from "lucide-react"

interface Order {
  id: string
  orderNumber: string
  restaurant: {
    id: string
    name: string
    image: string | null
  }
  status: string
  total: number
  discount?: number
  coupon?: {
    code: string
    name: string
  } | null
  createdAt: string
  items: Array<{
    id: string
    menuItem: {
      name: string
    }
    quantity: number
  }>
}

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
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
      case "CONFIRMED":
      case "PREPARING":
      case "OUT_FOR_DELIVERY":
        return <Clock className="h-4 w-4" />
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4" />
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Your Orders</h1>
            <p className="text-muted-foreground">
              Track your food delivery orders
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/")}
          >
            <Receipt className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { key: "all", label: "All Orders", count: orders.length },
            { 
              key: "pending", 
              label: "Active", 
              count: orders.filter(o => ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(o.status)).length 
            },
        
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? "default" : "outline"}
              onClick={() => setFilter(tab.key as any)}
              className="flex-1"
            >
              {tab.label}
              <Badge variant="secondary" className="ml-2">
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">No orders found</CardTitle>
              <CardDescription className="mb-4">
                {filter === "all" 
                  ? "You haven't placed any orders yet. Start by browsing restaurants!"
                  : `No ${filter} orders found.`
                }
              </CardDescription>
              {filter === "all" && (
                <Button onClick={() => router.push("/")}>
                  Browse Restaurants
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                orderNumber={order.orderNumber}
                restaurant={order.restaurant}
                status={order.status}
                total={order.total}
                createdAt={order.createdAt}
                itemCount={order.items.length}
                discount={order.discount}
                coupon={order.coupon}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

