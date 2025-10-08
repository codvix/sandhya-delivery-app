import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const notifications = await prisma.userNotification.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to last 100 notifications
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Failed to fetch user notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, title, message, orderId, orderNumber, status } = body

    const notification = await prisma.userNotification.create({
      data: {
        userId: user.id,
        type,
        title,
        message,
        orderId,
        orderNumber,
        status,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Failed to create user notification:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId, read } = body

    if (notificationId) {
      // Mark specific notification as read
      const notification = await prisma.userNotification.update({
        where: { 
          id: notificationId,
          userId: user.id // Ensure user can only update their own notifications
        },
        data: { read },
      })
      return NextResponse.json(notification)
    } else {
      // Mark all notifications as read
      await prisma.userNotification.updateMany({
        where: { userId: user.id },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("Failed to update user notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Clear all notifications for this user
    await prisma.userNotification.deleteMany({
      where: { userId: user.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to clear user notifications:", error)
    return NextResponse.json(
      { error: "Failed to clear notifications" },
      { status: 500 }
    )
  }
}
