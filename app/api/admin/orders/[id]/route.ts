import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: id },
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
            phone: true,
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
            landmark: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                isVeg: true,
              },
            },
          },
        },
      } as any,
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Fetch coupon data if exists
    let coupon = null
    if ((order as any).couponId) {
      coupon = await prisma.coupon.findUnique({
        where: { id: (order as any).couponId },
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          value: true,
        },
      })
    }

    const orderWithCoupon = {
      ...order,
      coupon,
    }

    return NextResponse.json(orderWithCoupon)
  } catch (error) {
    console.error("Failed to fetch admin order:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
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
    const user = await getCurrentUser(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      )
    }

    const validStatuses = [
      "PENDING",
      "CONFIRMED", 
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED"
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id: id },
      data: { status },
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
              },
            },
          },
        },
      },
    })

    // Create customer notification for order status change
    try {
      const statusMessages = {
        'CONFIRMED': 'Your order has been confirmed and is being prepared',
        'PREPARING': 'Your order is being prepared by the restaurant',
        'OUT_FOR_DELIVERY': 'Your order is out for delivery',
        'DELIVERED': 'Your order has been delivered!',
        'CANCELLED': 'Your order has been cancelled'
      }

      const message = statusMessages[status as keyof typeof statusMessages]
      if (message) {
        await prisma.userNotification.create({
          data: {
            userId: order.user.id,
            type: 'order_status',
            title: `Order #${order.orderNumber} Update`,
            message,
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: status,
          },
        })
      }
    } catch (notificationError) {
      console.error('Failed to create customer notification:', notificationError)
      // Don't fail the order update if notification creation fails
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Failed to update order status:", error)
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    )
  }
}

