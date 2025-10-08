"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useLocation } from "@/hooks/use-location"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BottomNav } from "@/components/bottom-nav"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AddressSelector } from "@/components/address-selector"
import { TipGuidance } from "@/components/tip-guidance"
import { DeliveryFreeGuidance } from "@/components/delivery-free-guidance"
import { Minus, Plus, Trash2, MapPin, Clock, CreditCard } from "lucide-react"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils/currency"

export default function CartPage() {
  const { 
    items, 
    restaurantData,
    userLocation,
    deliveryDistance,
    isDeliveryAvailable,
    getTotalPrice, 
    getDeliveryFee, 
    getTax, 
    getTotal, 
    updateQuantity, 
    removeItem,
    clearCart,
    setRestaurantData,
    setUserLocation
  } = useCart()
  const router = useRouter()
  const { getCurrentLocation, loading: locationLoading, error: locationError } = useLocation()
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [tip, setTip] = useState(0)
  const [loading, setLoading] = useState(false)
  const [restaurantLoading, setRestaurantLoading] = useState(false)

  // Fetch restaurant data when component mounts
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (items.length > 0 && !restaurantData) {
        setRestaurantLoading(true)
        try {
          const response = await fetch(`/api/restaurants/${items[0].restaurantId}/coordinates`)
          if (response.ok) {
            const data = await response.json()
            setRestaurantData(data)
          }
        } catch (error) {
          console.error("Failed to fetch restaurant data:", error)
        } finally {
          setRestaurantLoading(false)
        }
      }
    }

    fetchRestaurantData()
  }, [items, restaurantData, setRestaurantData])

  // Fetch user location when component mounts
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!userLocation) {
        try {
          const location = await getCurrentLocation()
          setUserLocation(location)
        } catch (error) {
          console.error("Failed to get user location:", error)
        }
      }
    }

    fetchUserLocation()
  }, [userLocation, getCurrentLocation, setUserLocation])

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, quantity)
    }
  }

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address")
      return
    }

    if (!userLocation) {
      alert("Please allow location access to calculate delivery fee")
      return
    }

    if (!isDeliveryAvailable) {
      alert("Delivery not available beyond 5km radius")
      return
    }

    setLoading(true)
    try {
      const orderData = {
        restaurantId: items[0]?.restaurantId,
        addressId: selectedAddress,
        items: items.map((item: any) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        tip: tip,
        paymentMethod: "COD"
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-latitude": userLocation.latitude.toString(),
          "x-user-longitude": userLocation.longitude.toString(),
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        clearCart()
        router.push("/orders")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to place order")
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to place order: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">Your cart is empty</CardTitle>
              <CardDescription className="mb-4">
                Add some delicious food to get started!
              </CardDescription>
              <Button onClick={() => router.push("/")}>
                Browse Restaurants
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const deliveryFee = getDeliveryFee()
  const tax = getTax()
  const total = getTotal() + tip

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 pb-20">
        <div className="space-y-6">
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Your Order</CardTitle>
              <CardDescription>
                {items.length} item{items.length !== 1 ? 's' : ''} from {items[0]?.restaurantName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
              <AddressSelector
                selectedAddressId={selectedAddress}
                onSelectAddress={setSelectedAddress}
              />
            </CardContent>
          </Card>

          {/* Tip Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Tip Your Driver</CardTitle>
              <CardDescription>
                Show appreciation for your delivery driver
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {[0, 50, 100].map((tipAmount) => (
                  <Button
                    key={tipAmount}
                    variant={tip === tipAmount ? "default" : "outline"}
                    onClick={() => setTip(tipAmount)}
                    className="h-12"
                  >
                    {tipAmount === 0 ? "No Tip" : `₹${tipAmount}`}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between">
                  <span>Tip</span>
                  <span>{formatCurrency(tip)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardContent className="p-4 space-y-2">
              {locationLoading && (
                <p className="text-sm text-blue-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Getting your location...
                </p>
              )}
              
              {locationError && (
                <p className="text-sm text-red-600">
                  Location access denied. Please enable location permissions.
                </p>
              )}
              
              {userLocation && restaurantData && (
                <div className="space-y-1">
                  <p className="text-sm text-green-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location detected
                  </p>
                  {deliveryDistance !== null && (
                    <p className="text-sm text-muted-foreground">
                      Distance: {deliveryDistance.toFixed(1)} km
                    </p>
                  )}
                  {!isDeliveryAvailable && (
                    <p className="text-sm text-red-600">
                      Delivery not available beyond 5km radius
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                {getTotalPrice() >= 19900 
                  ? "Free delivery on orders ≥₹199" 
                  : "Free delivery on orders ≥₹199, otherwise ₹10 + ₹10/km"
                }
              </p>
            </CardContent>
          </Card>

          {/* Checkout Button */}
          <Button 
            onClick={handleCheckout} 
            className="w-full h-12 text-lg"
            disabled={loading || !selectedAddress || !userLocation || !isDeliveryAvailable}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Place Order - {formatCurrency(total)}
              </>
            )}
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
