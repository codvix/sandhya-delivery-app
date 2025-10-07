/**
 * Fee Management Library - Type Definitions
 * 
 * This library provides a flexible and configurable system for managing
 * various types of fees, taxes, and charges in the food delivery application.
 */

export type FeeType = 
  | 'delivery'
  | 'tax'
  | 'service'
  | 'platform'
  | 'packaging'
  | 'tip'
  | 'discount'
  | 'surcharge'

export type FeeCalculationMethod = 
  | 'fixed'        // Fixed amount in cents
  | 'percentage'   // Percentage of subtotal
  | 'tiered'       // Different rates based on order value
  | 'conditional'  // Based on specific conditions

export interface FeeConfig {
  id: string
  name: string
  type: FeeType
  method: FeeCalculationMethod
  enabled: boolean
  priority: number // Order of calculation (lower = earlier)
  
  // Fixed amount (for 'fixed' method)
  amount?: number
  
  // Percentage (for 'percentage' method)
  percentage?: number
  
  // Tiered configuration (for 'tiered' method)
  tiers?: FeeTier[]
  
  // Conditional configuration (for 'conditional' method)
  conditions?: FeeCondition[]
  
  // Display settings
  displayName?: string
  description?: string
  showInBreakdown?: boolean
  
  // Validation rules
  minAmount?: number
  maxAmount?: number
  minOrderValue?: number
  maxOrderValue?: number
}

export interface FeeTier {
  minOrderValue: number
  maxOrderValue?: number
  amount?: number
  percentage?: number
}

export interface FeeCondition {
  field: string // e.g., 'restaurantId', 'deliveryLevel', 'paymentMethod'
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than'
  value: any
  amount?: number
  percentage?: number
}

export interface FeeCalculationContext {
  subtotal: number
  restaurantId?: string
  deliveryLevel?: 'STANDARD' | 'EXPRESS' | 'PRIORITY'
  paymentMethod?: string
  userType?: 'regular' | 'premium' | 'vip'
  orderTime?: Date
  deliveryDistance?: number
  userLocation?: {
    latitude: number
    longitude: number
  }
  restaurantLocation?: {
    latitude: number
    longitude: number
  }
  customData?: Record<string, any>
}

export interface FeeResult {
  id: string
  name: string
  type: FeeType
  amount: number
  method: FeeCalculationMethod
  displayName: string
  description?: string
  showInBreakdown: boolean
  applied: boolean
  reason?: string // Why this fee was applied or not applied
}

export interface OrderCalculationResult {
  subtotal: number
  fees: FeeResult[]
  total: number
  breakdown: {
    subtotal: number
    fees: FeeResult[]
    total: number
  }
}

export interface FeeConfiguration {
  version: string
  lastUpdated: Date
  fees: FeeConfig[]
  globalSettings: {
    currency: string
    roundingMethod: 'round' | 'floor' | 'ceil'
    displayPrecision: number
  }
}
