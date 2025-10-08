import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const cuisine = searchParams.get("cuisine")

    const restaurants = await prisma.restaurant.findMany({
      where: {
        isOpen: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { cuisines: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(cuisine && {
          cuisines: { contains: cuisine, mode: "insensitive" },
        }),
      },
      include: {
        menuItems: {
          where: { isAvailable: true },
          take: 3, // Show first 3 menu items
        },
        _count: {
          select: {
            menuItems: {
              where: { isAvailable: true },
            },
          },
        },
      },
      orderBy: {
        rating: "desc",
      },
    })

    return NextResponse.json(restaurants)
  } catch (error) {
    console.error("Failed to fetch restaurants:", error)
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    )
  }
}

