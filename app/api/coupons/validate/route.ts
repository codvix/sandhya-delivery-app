// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"

// POST /api/coupons/validate - Validate coupon code and calculate discount
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { code, restaurantId, subtotal } = await request.json()

    if (!code || !subtotal) {
      return NextResponse.json(
        { error: "Coupon code and subtotal are required" },
        { status: 400 }
      )
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      )
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "Coupon is not active" },
        { status: 400 }
      )
    }

    // Check validity period
    const now = new Date()
    if (coupon.validFrom > now) {
      return NextResponse.json(
        { error: "Coupon is not yet valid" },
        { status: 400 }
      )
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      )
    }

    // Check if coupon is applicable to this restaurant
    if (coupon.applicableTo && coupon.applicableTo !== restaurantId) {
      return NextResponse.json(
        { error: "Coupon is not applicable to this restaurant" },
        { status: 400 }
      )
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { 
          error: `Minimum order amount of ${formatCurrency(coupon.minOrderAmount)} required`,
          minOrderAmount: coupon.minOrderAmount
        },
        { status: 400 }
      )
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "Coupon usage limit exceeded" },
        { status: 400 }
      )
    }

    // Check if user has already used this coupon
    const userUsage = await prisma.couponUsage.findFirst({
      where: {
        couponId: coupon.id,
        userId: user.id
      }
    })

    if (userUsage) {
      return NextResponse.json(
        { error: "You have already used this coupon" },
        { status: 400 }
      )
    }

    // Calculate discount
    let discountAmount = 0

    if (coupon.type === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * coupon.value) / 100)
      
      // Apply maximum discount limit if set
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discountAmount = coupon.value
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        discountAmount
      }
    })
  } catch (error) {
    console.error("Failed to validate coupon:", error)
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    )
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
