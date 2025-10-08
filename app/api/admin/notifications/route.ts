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

    const notifications = await prisma.adminNotification.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to last 100 notifications
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Failed to fetch admin notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, title, message, orderId, orderNumber, status, restaurantName, customerName } = body

    // Check if notification already exists for this order
    if (orderId) {
      const existingNotification = await prisma.adminNotification.findFirst({
        where: {
          orderId: orderId,
          type: type
        }
      })

      if (existingNotification) {
        return NextResponse.json(existingNotification)
      }
    }

    const notification = await prisma.adminNotification.create({
      data: {
        type,
        title,
        message,
        orderId,
        orderNumber,
        status,
        restaurantName,
        customerName,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Failed to create admin notification:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId, read } = body

    if (notificationId) {
      // Mark specific notification as read
      const notification = await prisma.adminNotification.update({
        where: { id: notificationId },
        data: { read },
      })
      return NextResponse.json(notification)
    } else {
      // Mark all notifications as read
      await prisma.adminNotification.updateMany({
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("Failed to update admin notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Clear all notifications
    await prisma.adminNotification.deleteMany({})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to clear admin notifications:", error)
    return NextResponse.json(
      { error: "Failed to clear notifications" },
      { status: 500 }
    )
  }
}
