"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { OrderStatusTimeline } from "@/components/order-status-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BottomNav } from "@/components/bottom-nav"
import { LoadingSpinner } from "@/components/loading-spinner"
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Clock, 
  CreditCard,
  Package,
  CheckCircle,
  XCircle
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"

interface Order {
  id: string
  orderNumber: string
  status: string
  deliveryLevel: string
  subtotal: number
  deliveryFee: number
  tax: number
  tip: number
  total: number
  paymentMethod: string
  paymentStatus: string
  specialInstructions: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    phone: string
  }
  restaurant: {
    id: string
    name: string
    image: string | null
    phone: string | null
  }
  address: {
    id: string
    label: string
    street: string
    city: string
    state: string
    zipCode: string
    landmark: string | null
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    menuItem: {
      id: string
      name: string
      description: string
      image: string | null
      isVeg: boolean
    }
  }>
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const orderId = params.id as string

  useEffect(() => {
    if (orderId && user) {
      fetchOrderDetails()
    }
  }, [orderId, user])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else if (response.status === 404) {
        router.push("/orders")
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "CONFIRMED":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "PREPARING":
        return <Package className="h-5 w-5 text-orange-500" />
      case "OUT_FOR_DELIVERY":
        return <Package className="h-5 w-5 text-purple-500" />
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">Order not found</CardTitle>
            <CardDescription className="mb-4">
              The order you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
            <Button onClick={() => router.push("/orders")}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Order #{order.orderNumber}</h1>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 pb-20">
        <div className="space-y-6">
          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span>Order Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline status={order.status} />
            </CardContent>
          </Card>

          {/* Restaurant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{order.restaurant.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Order #{order.orderNumber}
                  </p>
                </div>
                {order.restaurant.phone && (
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Delivery Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{order.address.label}</p>
                <p className="text-muted-foreground">
                  {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}
                </p>
                {order.address.landmark && (
                  <p className="text-sm text-muted-foreground">
                    Near: {order.address.landmark}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    {item.menuItem.image ? (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.menuItem.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.menuItem.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={item.menuItem.isVeg ? "default" : "destructive"}>
                        {item.menuItem.isVeg ? "Veg" : "Non-Veg"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.specialInstructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {order.tip > 0 && (
                <div className="flex justify-between">
                  <span>Tip</span>
                  <span>{formatCurrency(order.tip)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Payment Method</span>
                <span className="flex items-center space-x-1">
                  <CreditCard className="h-4 w-4" />
                  <span>{order.paymentMethod}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

