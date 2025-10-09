"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { formatCurrency } from "@/lib/utils/currency"
import { X, Tag, CheckCircle } from "lucide-react"

export function CouponInput() {
  const { appliedCoupon, applyCoupon, removeCoupon, getDiscount } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await applyCoupon(couponCode.trim())
      if (result.success) {
        setCouponCode("")
      } else {
        setError(result.error || "Invalid coupon code")
      }
    } catch (error) {
      setError("Failed to apply coupon")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    setError("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyCoupon()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Tag className="h-5 w-5" />
          <span>Coupon Code</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appliedCoupon ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{appliedCoupon.name}</p>
                  <p className="text-sm text-green-600">Code: {appliedCoupon.code}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  -{formatCurrency(appliedCoupon.discountAmount)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
                className="px-6"
              >
                {loading ? "Applying..." : "Apply"}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
