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
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            menuItems: {
              where: { isAvailable: true },
            },
            orders: true,
          },
        },
      },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error("Failed to fetch restaurant:", error)
    return NextResponse.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { name, description, image, coverImage, deliveryTime, costForTwo, cuisines, isOpen, address, phone, gstNumber } = await request.json()

    // Check if user owns this restaurant or is admin
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id,
        OR: [
          { ownerId: session.userId },
          { owner: { role: "ADMIN" } }
        ]
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found or unauthorized" },
        { status: 404 }
      )
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(coverImage !== undefined && { coverImage }),
        ...(deliveryTime && { deliveryTime }),
        ...(costForTwo && { costForTwo }),
        ...(cuisines !== undefined && { cuisines }),
        ...(isOpen !== undefined && { isOpen }),
        ...(address && { address }),
        ...(phone !== undefined && { phone }),
        ...(gstNumber !== undefined && { gstNumber })
      }
    })

    return NextResponse.json(updatedRestaurant)
  } catch (error) {
    console.error("Failed to update restaurant:", error)
    return NextResponse.json(
      { error: "Failed to update restaurant" },
      { status: 500 }
    )
  }
}

