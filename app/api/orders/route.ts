import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { calculateDistance, calculateDeliveryFee, isDeliveryPossible } from "@/lib/utils/distance"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        address: {
          select: {
            id: true,
            label: true,
            street: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { restaurantId, addressId, items, tip, paymentMethod } = await request.json()

    if (!restaurantId || !addressId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Restaurant ID, address ID, and items are required" },
        { status: 400 }
      )
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      )
    }

    // Validate restaurant has coordinates
    if (!restaurant.latitude || !restaurant.longitude) {
      return NextResponse.json(
        { error: "Restaurant location not available" },
        { status: 400 }
      )
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    })

    if (!address) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      )
    }

    // Get menu items and calculate totals
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: items.map((item: any) => item.menuItemId) },
        restaurantId,
        isAvailable: true,
      },
    })

    if (menuItems.length !== items.length) {
      return NextResponse.json(
        { error: "Some menu items are not available" },
        { status: 400 }
      )
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = items.map((item: any) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId)!
      const itemTotal = menuItem.price * item.quantity
      subtotal += itemTotal
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
      }
    })

    // Get user's current location from request headers
    const userLatitude = request.headers.get('x-user-latitude')
    const userLongitude = request.headers.get('x-user-longitude')
    
    if (!userLatitude || !userLongitude) {
      return NextResponse.json(
        { error: "User location is required for delivery" },
        { status: 400 }
      )
    }

    // Calculate distance between user and restaurant
    const userLocation = { latitude: parseFloat(userLatitude), longitude: parseFloat(userLongitude) }
    const restaurantLocation = { latitude: restaurant.latitude!, longitude: restaurant.longitude! }
    const distance = calculateDistance(userLocation, restaurantLocation)
    
    // Validate delivery is possible within 5km radius
    if (!isDeliveryPossible(distance)) {
      return NextResponse.json(
        { error: "Delivery not available beyond 5km radius" },
        { status: 400 }
      )
    }
    
    // Calculate delivery fee based on new logic
    const deliveryFee = calculateDeliveryFee(distance, subtotal)
    
    // Calculate tax (simplified - 5% tax)
    const tax = Math.round(subtotal * 0.05)
    
    const total = subtotal + deliveryFee + tax + (tip || 0)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        restaurantId,
        addressId,
        subtotal,
        deliveryFee,
        tax,
        tip: tip || 0,
        total,
        paymentMethod: paymentMethod || "COD",
        items: {
          create: orderItems,
        },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        address: {
          select: {
            id: true,
            label: true,
            street: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Failed to create order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

