"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { calculateDistance, calculateDeliveryFee, isDeliveryPossible } from "@/lib/utils/distance"

interface CartItem {
  id: string
  name: string
  price: number
  image: string | null
  restaurantId: string
  restaurantName: string
  quantity: number
}

interface RestaurantData {
  id: string
  name: string
  latitude: number
  longitude: number
}

interface UserLocation {
  latitude: number
  longitude: number
}

interface CouponDiscount {
  couponId: string
  code: string
  name: string
  discountAmount: number
}

interface CartContextType {
  items: CartItem[]
  restaurantData: RestaurantData | null
  userLocation: UserLocation | null
  deliveryDistance: number | null
  isDeliveryAvailable: boolean
  appliedCoupon: CouponDiscount | null
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  setRestaurantData: (data: RestaurantData) => void
  setUserLocation: (location: UserLocation) => void
  applyCoupon: (couponCode: string) => Promise<{ success: boolean; error?: string }>
  removeCoupon: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getDeliveryFee: () => number
  getTax: () => number
  getDiscount: () => number
  getTotal: () => number
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [restaurantData, setRestaurantDataState] = useState<RestaurantData | null>(null)
  const [userLocation, setUserLocationState] = useState<UserLocation | null>(null)
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null)
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(true)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDiscount | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("global_cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error parsing saved cart:", error)
        setItems([])
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("global_cart", JSON.stringify(items))
  }, [items])

  // Calculate distance when both user location and restaurant data are available
  useEffect(() => {
    if (userLocation && restaurantData) {
      const distance = calculateDistance(userLocation, {
        latitude: restaurantData.latitude,
        longitude: restaurantData.longitude
      })
      setDeliveryDistance(distance)
      setIsDeliveryAvailable(isDeliveryPossible(distance))
    }
  }, [userLocation, restaurantData])

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id)
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevItems, { ...newItem, quantity: 1 }]
      }
    })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }

  const getTotalItems = (): number => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getTotalPrice = (): number => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getDeliveryFee = (): number => {
    const subtotal = getTotalPrice()
    
    // Free delivery for orders ≥₹199
    if (subtotal >= 19900) {
      return 0
    }
    
    // If we have distance data, calculate accurate delivery fee
    if (deliveryDistance !== null) {
      return calculateDeliveryFee(deliveryDistance, subtotal)
    }
    
    // Fallback: show estimated fee if distance not available
    return 1000 // ₹10 base fee
  }

  const getTax = (): number => {
    const subtotal = getTotalPrice()
    return Math.round(subtotal * 0.05) // 5% tax
  }

  const getDiscount = (): number => {
    return appliedCoupon?.discountAmount || 0
  }

  const getTotal = (): number => {
    return getTotalPrice() + getDeliveryFee() + getTax() - getDiscount()
  }

  const clearCart = () => {
    setItems([])
    setAppliedCoupon(null)
  }

  const applyCoupon = async (couponCode: string): Promise<{ success: boolean; error?: string }> => {
    if (!restaurantData || items.length === 0) {
      return { success: false, error: "No items in cart" }
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          restaurantId: restaurantData.id,
          subtotal: getTotalPrice(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setAppliedCoupon({
          couponId: data.coupon.id,
          code: data.coupon.code,
          name: data.coupon.name,
          discountAmount: data.coupon.discountAmount,
        })
        return { success: true }
      } else {
        return { success: false, error: data.error || "Invalid coupon" }
      }
    } catch (error) {
      console.error("Failed to validate coupon:", error)
      return { success: false, error: "Failed to validate coupon" }
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  const setRestaurantData = (data: RestaurantData) => {
    setRestaurantDataState(data)
  }

  const setUserLocation = (location: UserLocation) => {
    setUserLocationState(location)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantData,
        userLocation,
        deliveryDistance,
        isDeliveryAvailable,
        appliedCoupon,
        addToCart,
        updateQuantity,
        removeItem,
        setRestaurantData,
        setUserLocation,
        applyCoupon,
        removeCoupon,
        getTotalItems,
        getTotalPrice,
        getDeliveryFee,
        getTax,
        getDiscount,
        getTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
