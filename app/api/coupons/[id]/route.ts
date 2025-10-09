// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

// GET /api/coupons/[id] - Get specific coupon
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { couponUsages: true }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Failed to fetch coupon:", error)
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    )
  }
}

// PUT /api/coupons/[id] - Update coupon (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const {
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      isActive,
      validUntil,
      applicableTo
    } = await request.json()

    // Validate value based on type
    if (type === 'PERCENTAGE' && (value < 1 || value > 100)) {
      return NextResponse.json(
        { error: "Percentage value must be between 1 and 100" },
        { status: 400 }
      )
    }

    if (type === 'FIXED_AMOUNT' && value <= 0) {
      return NextResponse.json(
        { error: "Fixed amount must be greater than 0" },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        name,
        description,
        type,
        value,
        minOrderAmount: minOrderAmount || null,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        isActive: isActive !== undefined ? isActive : true,
        validUntil: validUntil ? new Date(validUntil) : null,
        applicableTo: applicableTo || null
      }
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Failed to update coupon:", error)
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    )
  }
}

// DELETE /api/coupons/[id] - Delete coupon (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.coupon.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Failed to delete coupon:", error)
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    )
  }
}
