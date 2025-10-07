"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Heart, Star, Coffee, Gift } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"

interface TipGuidanceProps {
  subtotal: number
  tipAmount: number
  onTipChange: (amount: number) => void
}

const tipSuggestions = [
  { label: "No tip", value: 0, icon: null },
  { label: "10%", value: 0.1, icon: Coffee },
  { label: "15%", value: 0.15, icon: Star },
  { label: "20%", value: 0.2, icon: Heart },
  { label: "25%", value: 0.25, icon: Gift },
]

export function TipGuidance({ subtotal, tipAmount, onTipChange }: TipGuidanceProps) {
  const [customTip, setCustomTip] = useState("")
  
  // Convert tip amount from cents to rupees for display
  const tipInRupees = Math.round(tipAmount / 100)

  const handleTipSuggestion = (multiplier: number) => {
    const amount = Math.round(subtotal * multiplier)
    onTipChange(amount)
    setCustomTip("")
  }

  const handleCustomTip = (value: string) => {
    setCustomTip(value)
    const amount = (parseInt(value) || 0) * 100 // Convert rupees to cents
    onTipChange(amount)
  }

  // Update custom tip display when tip amount changes from other sources
  React.useEffect(() => {
    if (tipAmount > 0 && !customTip) {
      setCustomTip(tipInRupees.toString())
    }
  }, [tipAmount, tipInRupees, customTip])

  const getTipPercentage = () => {
    if (subtotal === 0) return 0
    return Math.round((tipAmount / subtotal) * 100)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" />
            Tip Your Driver
          </h3>
          <span className="text-sm text-muted-foreground">
            {tipAmount > 0 && `${getTipPercentage()}%`}
          </span>
        </div>

        <div className="text-sm text-muted-foreground mb-3">
          Show appreciation for your delivery driver. Tips help support our delivery partners.
        </div>

        {/* Quick tip suggestions */}
        <div className="grid grid-cols-3 gap-2">
          {tipSuggestions.map((suggestion) => {
            const Icon = suggestion.icon
            const amount = Math.round(subtotal * suggestion.value)
            const isSelected = tipAmount === amount

            return (
              <Button
                key={suggestion.label}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleTipSuggestion(suggestion.value)}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                {Icon && <Icon className="h-3 w-3" />}
                <span className="text-xs font-medium">{suggestion.label}</span>
                {amount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(amount)}
                  </span>
                )}
              </Button>
            )
          })}
        </div>

        <Separator />

        {/* Custom tip input */}
        <div className="space-y-2">
          <Label htmlFor="custom-tip" className="text-sm">
            Custom Amount
          </Label>
          <div className="flex gap-2">
            <Input
              id="custom-tip"
              type="number"
              placeholder="Enter amount in ₹"
              value={customTip || (tipInRupees > 0 ? tipInRupees.toString() : "")}
              onChange={(e) => handleCustomTip(e.target.value)}
              className="flex-1"
              min="0"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomTip("")
                onTipChange(0)
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Tip guidance messages */}
        {tipAmount > 0 && (
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              <Heart className="h-3 w-3 inline mr-1" />
              Thank you for tipping! Your driver will appreciate it.
            </p>
          </div>
        )}

        {/* Tip suggestions based on order value */}
        {subtotal > 0 && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Tip guidance:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• 10-15% for good service</li>
              <li>• 20%+ for excellent service</li>
              <li>• Even small tips make a difference!</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
