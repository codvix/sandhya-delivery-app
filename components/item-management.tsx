"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash, Eye, EyeOff, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  isVeg: boolean
  isAvailable: boolean
  isPopular: boolean
  category?: {
    name: string
  }
}

interface ItemManagementProps {
  items: MenuItem[]
  selectedRestaurant: string
  selectedCategory: string
  restaurants: any[]
  categories: any[]
  onRestaurantChange: (restaurantId: string) => void
  onCategoryChange: (categoryId: string) => void
  onRefresh: () => void
  onCreateItem: (item: any) => void
  onUpdateItem: (id: string, data: any) => void
  onDeleteItem: (id: string) => void
  savingItem: boolean
}

export function ItemManagement({
  items,
  selectedRestaurant,
  selectedCategory,
  restaurants,
  categories,
  onRestaurantChange,
  onCategoryChange,
  onRefresh,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  savingItem
}: ItemManagementProps) {
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
    isVeg: true,
    isAvailable: true,
    isPopular: false,
  })

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
    isVeg: true,
    isAvailable: true,
    isPopular: false,
  })

  const handleCreateItem = () => {
    if (!selectedRestaurant || !selectedCategory) return
    onCreateItem({ ...newItem, price: Math.round((newItem.price || 0) * 100) })
    setNewItem({ name: "", description: "", price: 0, image: "", isVeg: true, isAvailable: true, isPopular: false })
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price / 100, // Convert from cents to rupees
      image: item.image,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      isPopular: item.isPopular,
    })
  }

  const handleUpdateItem = () => {
    if (!editingItem) return
    onUpdateItem(editingItem.id, { 
      ...editForm, 
      price: Math.round((editForm.price || 0) * 100) 
    })
    setEditingItem(null)
  }

  const handleToggleAvailability = (item: MenuItem) => {
    onUpdateItem(item.id, { isAvailable: !item.isAvailable })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <select 
            className="w-full border rounded-lg px-3 py-2 text-sm" 
            value={selectedRestaurant} 
            onChange={(e) => onRestaurantChange(e.target.value)}
          >
            <option value="">All Restaurants</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select 
            className="w-full border rounded-lg px-3 py-2 text-sm" 
            value={selectedCategory} 
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <Button variant="outline" className="w-full" onClick={onRefresh}>Refresh Items</Button>
      </div>

      {/* Create New Item */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-4 w-4" />
            New Item
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Item Name</Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium">Image URL</Label>
              <Input
                id="image"
                placeholder="https://example.com/image.jpg"
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price in rupees"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Input
                id="description"
                placeholder="Enter item description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVeg"
                checked={newItem.isVeg}
                onCheckedChange={(checked) => setNewItem({ ...newItem, isVeg: !!checked })}
              />
              <Label htmlFor="isVeg" className="text-sm">Vegetarian</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAvailable"
                checked={newItem.isAvailable}
                onCheckedChange={(checked) => setNewItem({ ...newItem, isAvailable: !!checked })}
              />
              <Label htmlFor="isAvailable" className="text-sm">Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPopular"
                checked={newItem.isPopular}
                onCheckedChange={(checked) => setNewItem({ ...newItem, isPopular: !!checked })}
              />
              <Label htmlFor="isPopular" className="text-sm">Popular</Label>
            </div>
          </div>

          <Button 
            onClick={handleCreateItem} 
            disabled={savingItem || !selectedRestaurant || !selectedCategory}
            className="w-full"
          >
            {savingItem ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Item
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Menu Items</h3>
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      {item.isPopular && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                      {item.isVeg && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Veg
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{formatCurrency(item.price)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Category: {item.category?.name || "No category"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailability(item)}
                    className="h-8 px-3 text-xs"
                  >
                    {item.isAvailable ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                        className="h-8 px-3 text-xs"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-lg">Edit Item</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-sm font-medium">Item Name</Label>
                            <Input
                              id="edit-name"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-image" className="text-sm font-medium">Image URL</Label>
                            <Input
                              id="edit-image"
                              value={editForm.image}
                              onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-price" className="text-sm font-medium">Price (₹)</Label>
                            <Input
                              id="edit-price"
                              type="number"
                              value={editForm.price}
                              onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                            <Input
                              id="edit-description"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-isVeg"
                              checked={editForm.isVeg}
                              onCheckedChange={(checked) => setEditForm({ ...editForm, isVeg: !!checked })}
                            />
                            <Label htmlFor="edit-isVeg" className="text-sm">Vegetarian</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-isAvailable"
                              checked={editForm.isAvailable}
                              onCheckedChange={(checked) => setEditForm({ ...editForm, isAvailable: !!checked })}
                            />
                            <Label htmlFor="edit-isAvailable" className="text-sm">Available</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-isPopular"
                              checked={editForm.isPopular}
                              onCheckedChange={(checked) => setEditForm({ ...editForm, isPopular: !!checked })}
                            />
                            <Label htmlFor="edit-isPopular" className="text-sm">Popular</Label>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditingItem(null)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateItem} className="flex-1">
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                    className="h-8 px-3 text-xs"
                  >
                    <Trash className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
