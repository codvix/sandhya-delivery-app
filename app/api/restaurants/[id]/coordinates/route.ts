import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      )
    }

    if (!restaurant.latitude || !restaurant.longitude) {
      return NextResponse.json(
        { error: "Restaurant location not available" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      id: restaurant.id,
      name: restaurant.name,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    })
  } catch (error) {
    console.error("Failed to fetch restaurant coordinates:", error)
    return NextResponse.json(
      { error: "Failed to fetch restaurant data" },
      { status: 500 }
    )
  }
}
