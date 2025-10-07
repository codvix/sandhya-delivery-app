import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import Link from "next/link"
import Image from "next/image"

interface RestaurantCardProps {
  id: string
  name: string
  description: string
  image: string
  rating: number
  totalRatings: number
  deliveryTime: string
  costForTwo: number
  cuisines: string
  isOpen: boolean
}

export function RestaurantCard({
  id,
  name,
  description,
  image,
  rating,
  totalRatings,
  deliveryTime,
  costForTwo,
  cuisines,
  isOpen,
}: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 w-full">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
          {!isOpen && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Closed</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight mb-1">{name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{cuisines}</p>
            </div>
            <Badge variant="secondary" className="ml-2 flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              {rating}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{deliveryTime}</span>
            </div>
            <span className="text-muted-foreground">{formatCurrency(costForTwo)} for two</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
