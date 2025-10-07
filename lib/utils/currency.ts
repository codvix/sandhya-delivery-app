export function formatCurrency(cents: number): string {
  const amount = (cents || 0) / 100
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount)
}

export function parseCurrency(amount: string): number {
  if (!amount) return 0
  // Remove currency symbols, spaces, and grouping commas (Indian system)
  const normalized = amount.replace(/[^0-9.\-]/g, "")
  const value = Number.parseFloat(normalized)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}
