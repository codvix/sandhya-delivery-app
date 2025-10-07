"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface CartItem {
  menuItemId: string
  quantity: number
  restaurantId: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (menuItemId: string, restaurantId: string) => void
  removeFromCart: (menuItemId: string, restaurantId: string) => void
  getItemQuantity: (menuItemId: string, restaurantId: string) => number
  getTotalItems: () => number
  clearCart: (restaurantId?: string) => void
  getCartForRestaurant: (restaurantId: string) => CartItem[]
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("global_cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error parsing saved cart:", error)
        setCart([])
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("global_cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (menuItemId: string, restaurantId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        item => item.menuItemId === menuItemId && item.restaurantId === restaurantId
      )
      
      if (existingItem) {
        return prevCart.map(item =>
          item.menuItemId === menuItemId && item.restaurantId === restaurantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { menuItemId, quantity: 1, restaurantId }]
      }
    })
  }

  const removeFromCart = (menuItemId: string, restaurantId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        item => item.menuItemId === menuItemId && item.restaurantId === restaurantId
      )
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.menuItemId === menuItemId && item.restaurantId === restaurantId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      } else {
        return prevCart.filter(
          item => !(item.menuItemId === menuItemId && item.restaurantId === restaurantId)
        )
      }
    })
  }

  const getItemQuantity = (menuItemId: string, restaurantId: string): number => {
    const item = cart.find(
      item => item.menuItemId === menuItemId && item.restaurantId === restaurantId
    )
    return item?.quantity || 0
  }

  const getTotalItems = (): number => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const clearCart = (restaurantId?: string) => {
    if (restaurantId) {
      setCart(prevCart => prevCart.filter(item => item.restaurantId !== restaurantId))
    } else {
      setCart([])
    }
  }

  const getCartForRestaurant = (restaurantId: string): CartItem[] => {
    return cart.filter(item => item.restaurantId === restaurantId)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        getItemQuantity,
        getTotalItems,
        clearCart,
        getCartForRestaurant,
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
