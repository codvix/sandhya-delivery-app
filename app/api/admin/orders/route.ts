// @ts-nocheck
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

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
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
                image: true,
                isVeg: true,
              },
            },
          },
        },
      } as any,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Fetch coupon data separately for each order
    const ordersWithCoupons = await Promise.all(
      orders.map(async (order: any) => {
        let coupon = null
        if (order.couponId) {
          try {
            coupon = await prisma.coupon.findUnique({
              where: { id: order.couponId },
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
                value: true,
              },
            })
          } catch (error) {
            console.error('Error fetching coupon:', error)
          }
        }
        return {
          ...order,
          coupon,
        }
      })
    )

    return NextResponse.json(ordersWithCoupons)
  } catch (error) {
    console.error("Failed to fetch admin orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}


