"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import Image from "next/image"

interface MenuItemCardProps {
  id: string
  name: string
  description: string
  price: number
  image?: string | null
  isVeg: boolean
  isAvailable: boolean
  isPopular: boolean
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export function MenuItemCard({
  name,
  description,
  price,
  image,
  isVeg,
  isAvailable,
  isPopular,
  quantity,
  onAdd,
  onRemove,
}: MenuItemCardProps) {
  return (
    <Card className={!isAvailable ? "opacity-50" : ""}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <div
                className={`w-4 h-4 border-2 flex items-center justify-center mt-1 ${isVeg ? "border-green-600" : "border-red-600"}`}
              >
                <div className={`w-2 h-2 rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{name}</h4>
                  {isPopular && (
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
                <p className="font-semibold">{formatCurrency(price)}</p>
              </div>
            </div>
          </div>

          {image && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
            </div>
          )}
        </div>

        <div className="mt-3 flex justify-end">
          {quantity === 0 ? (
            <Button onClick={onAdd} disabled={!isAvailable} size="sm" className="w-24">
              {isAvailable ? "Add" : "Unavailable"}
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md">
              <Button onClick={onRemove} size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary-foreground/20">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-semibold w-8 text-center">{quantity}</span>
              <Button onClick={onAdd} size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary-foreground/20">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
