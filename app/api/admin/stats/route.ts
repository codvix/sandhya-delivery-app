import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get basic counts
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      totalUsers,
      totalRestaurants,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: {
            in: ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"],
          },
        },
      }),
      prisma.order.count({
        where: {
          status: {
            in: ["DELIVERED"],
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: "DELIVERED",
        },
        _sum: {
          total: true,
        },
      }),
      prisma.user.count(),
      prisma.restaurant.count(),
    ])

    const revenue = totalRevenue._sum.total || 0
    const averageOrderValue = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: revenue,
      averageOrderValue,
      totalUsers,
      totalRestaurants,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}

