// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || (session.role !== "RESTAURANT_OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let whereClause: any = { id: id }
    
    if (session.role === "RESTAURANT_OWNER") {
      whereClause.restaurant = {
        ownerId: session.userId
      }
    }

    const menuItem = await prisma.menuItem.findFirst({
      where: whereClause,
      include: {
        category: true
      }
    })

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error("Failed to fetch menu item:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu item" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || (session.role !== "RESTAURANT_OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, description, price, image, categoryId, isVeg, isAvailable, isPopular } = await request.json()

    let whereClause: any = { id: id }
    
    if (session.role === "RESTAURANT_OWNER") {
      whereClause.restaurant = {
        ownerId: session.userId
      }
    }

    const menuItem = await prisma.menuItem.updateMany({
      where: whereClause,
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: Math.round(price * 100) }),
        ...(image !== undefined && { image }),
        ...(categoryId && { categoryId }),
        ...(isVeg !== undefined && { isVeg }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(isPopular !== undefined && { isPopular })
      }
    })

    if (menuItem.count === 0) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      )
    }

    const updatedItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Failed to update menu item:", error)
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || (session.role !== "RESTAURANT_OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let whereClause: any = { id: params.id }
    
    if (session.role === "RESTAURANT_OWNER") {
      whereClause.restaurant = {
        ownerId: session.userId
      }
    }

    const result = await prisma.menuItem.deleteMany({
      where: whereClause
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete menu item:", error)
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    )
  }
}
