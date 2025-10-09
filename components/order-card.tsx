import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrderStatusColor, getOrderStatusLabel } from "@/lib/utils/order"
import { formatCurrency } from "@/lib/utils/currency"
import Link from "next/link"
import Image from "next/image"

interface OrderCardProps {
  id: string
  orderNumber: string
  restaurant: {
    name: string
    image: string | null
  } | null
  status: string
  total: number
  createdAt: string
  itemCount: number
}

export function OrderCard({ id, orderNumber, restaurant, status, total, createdAt, itemCount }: OrderCardProps) {
  return (
    <Link href={`/orders/${id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer mt-2">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image 
                src={restaurant?.image || "/placeholder.svg"} 
                alt={restaurant?.name || "Restaurant"} 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{restaurant?.name || "Unknown Restaurant"}</h3>
                  <p className="text-sm text-muted-foreground">Order #{orderNumber}</p>
                </div>
                <Badge className={getOrderStatusColor(status)}>{getOrderStatusLabel(status)}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{new Date(createdAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
