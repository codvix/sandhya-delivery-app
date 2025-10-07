import { Badge } from "@/components/ui/badge"
import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from "lucide-react"

interface OrderStatusTimelineProps {
  status: string
  createdAt: string
  updatedAt: string
}

export function OrderStatusTimeline({ status, createdAt, updatedAt }: OrderStatusTimelineProps) {
  const statuses = [
    { key: "PENDING", label: "Order Placed", icon: Clock },
    { key: "CONFIRMED", label: "Confirmed", icon: Check },
    { key: "PREPARING", label: "Preparing", icon: Package },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
  ]

  const currentStatusIndex = statuses.findIndex((s) => s.key === status)
  const isCancelled = status === "CANCELLED"

  if (isCancelled) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
        <h3 className="font-semibold text-lg mb-1">Order Cancelled</h3>
        <p className="text-sm text-muted-foreground">This order has been cancelled</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {statuses.map((statusItem, index) => {
        const Icon = statusItem.icon
        const isCompleted = index <= currentStatusIndex
        const isCurrent = index === currentStatusIndex

        return (
          <div key={statusItem.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              {index < statuses.length - 1 && (
                <div className={`w-0.5 h-12 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold ${isCurrent ? "text-primary" : ""}`}>{statusItem.label}</h4>
                {isCurrent && (
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
              {isCompleted && (
                <p className="text-sm text-muted-foreground">
                  {index === 0 ? new Date(createdAt).toLocaleString() : new Date(updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
