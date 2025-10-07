export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950"
    case "CONFIRMED":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950"
    case "PREPARING":
      return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950"
    case "OUT_FOR_DELIVERY":
      return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950"
    case "DELIVERED":
      return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950"
    case "CANCELLED":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950"
    default:
      return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950"
  }
}

export function getOrderStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}
