// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    let whereClause = {}
    
    if (session.role === "RESTAURANT_OWNER") {
      // For restaurant owners, get their restaurant's menu items
      const restaurant = await prisma.restaurant.findFirst({
        where: { ownerId: session.userId }
      })
      
      if (!restaurant) {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 }
        )
      }
      
      whereClause = { restaurantId: restaurant.id }
    } else if (session.role === "ADMIN" && restaurantId) {
      // For admins, get menu items for the specified restaurant
      whereClause = { restaurantId }
    } else {
      return NextResponse.json(
        { error: "Restaurant ID required for admin access" },
        { status: 400 }
      )
    }

    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        category: true
      }
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error("Failed to fetch menu items:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== "RESTAURANT_OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, description, price, image, categoryId, isVeg, isAvailable, isPopular, restaurantId } = await request.json()

    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, description, price, and category are required" },
        { status: 400 }
      )
    }

    let targetRestaurantId = restaurantId

    if (session.role === "RESTAURANT_OWNER") {
      // Get restaurant owned by this user
      const restaurant = await prisma.restaurant.findFirst({
        where: { ownerId: session.userId }
      })

      if (!restaurant) {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 }
        )
      }
      
      targetRestaurantId = restaurant.id
    } else if (session.role === "ADMIN") {
      if (!restaurantId) {
        return NextResponse.json(
          { error: "Restaurant ID required for admin access" },
          { status: 400 }
        )
      }
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Math.round(price * 100), // Convert to cents
        image,
        categoryId,
        restaurantId: targetRestaurantId,
        isVeg: isVeg || false,
        isAvailable: isAvailable !== false,
        isPopular: isPopular || false
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    console.error("Failed to create menu item:", error)
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    )
  }
}
