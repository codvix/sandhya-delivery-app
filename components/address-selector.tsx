"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, MapPin, Loader2 } from "lucide-react"

interface Address {
  id: string
  label: string
  street: string
  city: string
  state: string
  zipCode: string
  landmark: string | null
  isDefault: boolean
}

interface AddressSelectorProps {
  selectedAddressId: string | null
  onSelectAddress: (addressId: string) => void
}

export function AddressSelector({ selectedAddressId, onSelectAddress }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    landmark: "",
    isDefault: false,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAddresses()
  }, [])

  async function fetchAddresses() {
    try {
      const response = await fetch("/api/addresses")
      const data = await response.json()
      setAddresses(data.addresses)

      // Auto-select default address
      const defaultAddress = data.addresses.find((addr: Address) => addr.isDefault)
      if (defaultAddress && !selectedAddressId) {
        onSelectAddress(defaultAddress.id)
      }
    } catch (error) {
      console.error("[v0] Fetch addresses error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setAddresses([...addresses, data.address])
        onSelectAddress(data.address.id)
        setDialogOpen(false)
        setFormData({
          label: "Home",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          landmark: "",
          isDefault: false,
        })
      }
    } catch (error) {
      console.error("[v0] Create address error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Delivery Address</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Delivery Address</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Home, Work, Other"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="123 Main St, Apt 4B"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Near Central Park"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Address"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No addresses saved yet</p>
            <p className="text-sm">Add a delivery address to continue</p>
          </CardContent>
        </Card>
      ) : (
        <RadioGroup value={selectedAddressId || ""} onValueChange={onSelectAddress}>
          <div className="space-y-3">
            {addresses.map((address) => (
              <Card key={address.id} className={selectedAddressId === address.id ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <label htmlFor={address.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{address.label}</span>
                        {address.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </p>
                      {address.landmark && <p className="text-sm text-muted-foreground">Near {address.landmark}</p>}
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </RadioGroup>
      )}
    </div>
  )
}
