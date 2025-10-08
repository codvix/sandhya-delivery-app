"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, Store, Clock, DollarSign, MapPin, Phone } from "lucide-react"

interface Restaurant {
  id: string
  name: string
  description: string | null
  image: string | null
  coverImage: string | null
  rating: number
  totalRatings: number
  deliveryTime: string
  costForTwo: number
  cuisines: string | null
  isOpen: boolean
  address: string
  phone: string | null
  gstNumber: string | null
}

interface RestaurantSettingsProps {
  restaurant: Restaurant
  onUpdate: () => void
}

export function RestaurantSettings({ restaurant, onUpdate }: RestaurantSettingsProps) {
  const [formData, setFormData] = useState({
    name: restaurant.name,
    description: restaurant.description || "",
    image: restaurant.image || "",
    coverImage: restaurant.coverImage || "",
    deliveryTime: restaurant.deliveryTime,
    costForTwo: restaurant.costForTwo,
    cuisines: restaurant.cuisines || "",
    isOpen: restaurant.isOpen,
    address: restaurant.address,
    phone: restaurant.phone || "",
    gstNumber: restaurant.gstNumber || ""
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onUpdate()
        alert("Restaurant settings updated successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update restaurant settings")
      }
    } catch (error) {
      console.error("Failed to update restaurant:", error)
      alert("Failed to update restaurant settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Store className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
          <CardDescription>
            Update your restaurant's basic information and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="deliveryTime">Delivery Time</Label>
                <Input
                  id="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  placeholder="30-40 mins"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Tell customers about your restaurant..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image">Logo Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/logo.jpg"
                />
              </div>
              <div>
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costForTwo">Cost for Two (₹)</Label>
                <Input
                  id="costForTwo"
                  type="number"
                  value={formData.costForTwo}
                  onChange={(e) => setFormData({ ...formData, costForTwo: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="cuisines">Cuisines</Label>
                <Input
                  id="cuisines"
                  value={formData.cuisines}
                  onChange={(e) => setFormData({ ...formData, cuisines: e.target.value })}
                  placeholder="Indian, Chinese, Italian"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isOpen"
                checked={formData.isOpen}
                onCheckedChange={(checked) => setFormData({ ...formData, isOpen: checked })}
              />
              <Label htmlFor="isOpen">Restaurant is Open</Label>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Location & Contact</span>
          </CardTitle>
          <CardDescription>
            Update your restaurant's location and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                placeholder="Enter your restaurant address..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Pricing & Business</span>
          </CardTitle>
          <CardDescription>
            Manage your restaurant's business settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costForTwo">Average Cost for Two</Label>
                <Input
                  id="costForTwo"
                  type="number"
                  value={formData.costForTwo}
                  onChange={(e) => setFormData({ ...formData, costForTwo: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This helps customers understand your pricing
                </p>
              </div>
              <div>
                <Label htmlFor="deliveryTime">Estimated Delivery Time</Label>
                <Input
                  id="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  placeholder="30-40 mins"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Set realistic delivery expectations
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Restaurant Status</p>
                <p className="text-sm text-muted-foreground">
                  {formData.isOpen ? "Open for orders" : "Currently closed"}
                </p>
              </div>
              <Badge variant={formData.isOpen ? "default" : "secondary"}>
                {formData.isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
