import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // First verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: id },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      )
    }

    // Get categories with their menu items
    const categories = await prisma.category.findMany({
      include: {
        menuItems: {
          where: {
            restaurantId: id,
            isAvailable: true,
          },
          orderBy: [
            { isPopular: "desc" },
            { name: "asc" },
          ],
        },
      },
      orderBy: {
        order: "asc",
      },
    })

    // Filter out categories with no menu items
    const categoriesWithItems = categories.filter(
      (category) => category.menuItems.length > 0
    )

    return NextResponse.json(categoriesWithItems)
  } catch (error) {
    console.error("Failed to fetch restaurant menu:", error)
    return NextResponse.json(
      { error: "Failed to fetch restaurant menu" },
      { status: 500 }
    )
  }
}


