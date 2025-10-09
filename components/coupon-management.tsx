"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { formatCurrency, formatCouponValue } from "@/lib/utils/coupon"
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency"
import { Plus, Edit, Trash2, Tag, Calendar, Users, DollarSign, X } from "lucide-react"

interface Coupon {
  id: string
  code: string
  name: string
  description: string | null
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  minOrderAmount: number | null
  maxDiscount: number | null
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  validFrom: string
  validUntil: string | null
  applicableTo: string | null
  createdAt: string
  _count: {
    couponUsages: number
  }
}

interface Restaurant {
  id: string
  name: string
}

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    value: 0,
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    validUntil: '',
    applicableTo: '',
    isActive: true
  })

  useEffect(() => {
    fetchCoupons()
    fetchRestaurants()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons')
      if (response.ok) {
        const data = await response.json()
        setCoupons(data)
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/admin/restaurants')
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data)
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error)
    }
  }

  const handleCreateCoupon = async () => {
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          minOrderAmount: formData.minOrderAmount ? parseInt(formData.minOrderAmount) * 100 : null,
          maxDiscount: formData.maxDiscount ? parseInt(formData.maxDiscount) * 100 : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
          applicableTo: formData.applicableTo === 'all' ? null : formData.applicableTo || null,
          value: formData.type === 'PERCENTAGE' ? formData.value : formData.value * 100
        }),
      })

      if (response.ok) {
        setShowCreateForm(false)
        resetForm()
        fetchCoupons()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create coupon')
      }
    } catch (error) {
      console.error('Failed to create coupon:', error)
      alert('Failed to create coupon')
    }
  }

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return

    try {
      const response = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          minOrderAmount: formData.minOrderAmount ? parseInt(formData.minOrderAmount) * 100 : null,
          maxDiscount: formData.maxDiscount ? parseInt(formData.maxDiscount) * 100 : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
          applicableTo: formData.applicableTo === 'all' ? null : formData.applicableTo || null,
          value: formData.type === 'PERCENTAGE' ? formData.value : formData.value * 100
        }),
      })

      if (response.ok) {
        setEditingCoupon(null)
        resetForm()
        fetchCoupons()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update coupon')
      }
    } catch (error) {
      console.error('Failed to update coupon:', error)
      alert('Failed to update coupon')
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCoupons()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete coupon')
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error)
      alert('Failed to delete coupon')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      validUntil: '',
      applicableTo: 'all',
      isActive: true
    })
  }

  const startEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.type === 'PERCENTAGE' ? coupon.value : coupon.value / 100,
      minOrderAmount: coupon.minOrderAmount ? (coupon.minOrderAmount / 100).toString() : '',
      maxDiscount: coupon.maxDiscount ? (coupon.maxDiscount / 100).toString() : '',
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      applicableTo: coupon.applicableTo || 'all',
      isActive: coupon.isActive
    })
  }

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  const isActive = (coupon: Coupon) => {
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null
    
    return coupon.isActive && 
           validFrom <= now && 
           (!validUntil || validUntil >= now) &&
           (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading coupons...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Coupon Management</h3>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{coupon.name}</CardTitle>
                  <CardDescription className="font-mono text-sm">
                    {coupon.code}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={isActive(coupon) ? "default" : "secondary"}>
                    {isActive(coupon) ? "Active" : "Inactive"}
                  </Badge>
                  {isExpired(coupon.validUntil) && (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="font-medium">{formatCouponValue(coupon)}</span>
              </div>
              
              {coupon.minOrderAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Min Order</span>
                  <span className="font-medium">{formatCurrencyUtil(coupon.minOrderAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Usage</span>
                <span className="font-medium">
                  {coupon.usedCount}
                  {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valid Until</span>
                <span className="font-medium">
                  {coupon.validUntil 
                    ? new Date(coupon.validUntil).toLocaleDateString()
                    : "No expiry"
                  }
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Applicable To</span>
                <span className="font-medium">
                  {coupon.applicableTo 
                    ? restaurants.find(r => r.id === coupon.applicableTo)?.name || "Unknown"
                    : "All Restaurants"
                  }
                </span>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(coupon)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the coupon "{coupon.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {coupons.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No coupons found</CardTitle>
            <CardDescription>
              Create your first coupon to start offering discounts to customers.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingCoupon) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingCoupon(null)
                  resetForm()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Coupon Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="20% Off Special"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Get 20% off on your first order"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Discount Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT') => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">
                  {formData.type === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (₹)'} *
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                  placeholder={formData.type === 'PERCENTAGE' ? '20' : '50'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="100"
                />
              </div>
              {formData.type === 'PERCENTAGE' && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscount">Maximum Discount (₹)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="200"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="100 (leave empty for unlimited)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicableTo">Applicable Restaurant</Label>
              <Select
                value={formData.applicableTo || "all"}
                onValueChange={(value) => setFormData({ ...formData, applicableTo: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All restaurants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Restaurants</SelectItem>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingCoupon(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
                disabled={!formData.code || !formData.name || formData.value <= 0}
              >
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
