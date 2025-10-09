// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

// GET /api/coupons - Get all coupons (admin) or active coupons (user)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const isAdmin = user.role === 'ADMIN'

    const whereClause: any = {
      isActive: true,
      validFrom: { lte: new Date() },
      OR: [
        { validUntil: null },
        { validUntil: { gte: new Date() } }
      ]
    }

    // If not admin, only show active coupons
    if (!isAdmin) {
      whereClause.OR = [
        { applicableTo: null }, // Global coupons
        { applicableTo: restaurantId } // Restaurant-specific coupons
      ]
    }

    const coupons = await prisma.coupon.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { couponUsages: true }
        }
      }
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Failed to fetch coupons:", error)
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    )
  }
}

// POST /api/coupons - Create new coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const {
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      validUntil,
      applicableTo
    } = await request.json()

    // Validate required fields
    if (!code || !name || !type || !value) {
      return NextResponse.json(
        { error: "Code, name, type, and value are required" },
        { status: 400 }
      )
    }

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

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        type,
        value,
        minOrderAmount: minOrderAmount || null,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        applicableTo: applicableTo || null
      }
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error("Failed to create coupon:", error)
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    )
  }
}
