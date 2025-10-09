// @ts-nocheck
import { prisma } from "@/lib/prisma"

export interface CouponValidationResult {
  valid: boolean
  error?: string
  coupon?: {
    id: string
    code: string
    name: string
    description?: string
    type: 'PERCENTAGE' | 'FIXED_AMOUNT'
    value: number
    discountAmount: number
  }
  minOrderAmount?: number
}

export interface CouponDiscount {
  couponId: string
  code: string
  name: string
  discountAmount: number
}

export async function validateCoupon(
  code: string,
  userId: string,
  restaurantId: string,
  subtotal: number
): Promise<CouponValidationResult> {
  try {
    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return { valid: false, error: "Invalid coupon code" }
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return { valid: false, error: "Coupon is not active" }
    }

    // Check validity period
    const now = new Date()
    if (coupon.validFrom > now) {
      return { valid: false, error: "Coupon is not yet valid" }
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return { valid: false, error: "Coupon has expired" }
    }

    // Check if coupon is applicable to this restaurant
    if (coupon.applicableTo && coupon.applicableTo !== restaurantId) {
      return { valid: false, error: "Coupon is not applicable to this restaurant" }
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return { 
        valid: false, 
        error: `Minimum order amount of ${formatCurrency(coupon.minOrderAmount)} required`,
        minOrderAmount: coupon.minOrderAmount
      }
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: "Coupon usage limit exceeded" }
    }

    // Check if user has already used this coupon
    const userUsage = await prisma.couponUsage.findFirst({
      where: {
        couponId: coupon.id,
        userId: userId
      }
    })

    if (userUsage) {
      return { valid: false, error: "You have already used this coupon" }
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

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || undefined,
        type: coupon.type,
        value: coupon.value,
        discountAmount
      }
    }
  } catch (error) {
    console.error("Failed to validate coupon:", error)
    return { valid: false, error: "Failed to validate coupon" }
  }
}

export async function applyCouponToOrder(
  orderId: string,
  couponId: string,
  userId: string,
  discountAmount: number
): Promise<void> {
  try {
    // Create coupon usage record
    await prisma.couponUsage.create({
      data: {
        couponId,
        userId,
        orderId,
        discountAmount
      }
    })

    // Update coupon usage count
    await prisma.coupon.update({
      where: { id: couponId },
      data: {
        usedCount: {
          increment: 1
        }
      }
    })
  } catch (error) {
    console.error("Failed to apply coupon to order:", error)
    throw error
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

export function formatCouponValue(coupon: {
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
}): string {
  if (coupon.type === 'PERCENTAGE') {
    return `${coupon.value}% off`
  } else {
    return `${formatCurrency(coupon.value)} off`
  }
}
