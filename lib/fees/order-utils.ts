/**
 * Order Utilities - Helper functions for order calculations
 * 
 * This file provides utility functions specifically for order-related
 * calculations using the fee management system.
 */

import { FeeManager, createOrderContext } from './index'
import { OrderCalculationResult } from './types'

/**
 * Calculate order totals for cart items
 */
export function calculateCartTotals(
  items: Array<{ menuItemId: string; quantity: number; price: number }>,
  options: {
    restaurantId?: string
    deliveryLevel?: 'STANDARD' | 'EXPRESS' | 'PRIORITY'
    paymentMethod?: string
    userType?: 'regular' | 'premium' | 'vip'
    orderTime?: Date
    deliveryDistance?: number
  } = {}
): OrderCalculationResult {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const context = createOrderContext(subtotal, {
    restaurantId: options.restaurantId,
    deliveryLevel: options.deliveryLevel || 'STANDARD',
    paymentMethod: options.paymentMethod,
    userType: options.userType,
    orderTime: options.orderTime || new Date(),
    deliveryDistance: options.deliveryDistance
  })

  const feeManager = new FeeManager()
  return feeManager.calculateOrderTotal(context)
}

/**
 * Calculate order totals for order items (from database)
 */
export function calculateOrderTotals(
  items: Array<{ price: number; quantity: number }>,
  options: {
    restaurantId?: string
    deliveryLevel?: 'STANDARD' | 'EXPRESS' | 'PRIORITY'
    paymentMethod?: string
    userType?: 'regular' | 'premium' | 'vip'
    orderTime?: Date
    deliveryDistance?: number
  } = {}
): OrderCalculationResult {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const context = createOrderContext(subtotal, {
    restaurantId: options.restaurantId,
    deliveryLevel: options.deliveryLevel || 'STANDARD',
    paymentMethod: options.paymentMethod,
    userType: options.userType,
    orderTime: options.orderTime || new Date(),
    deliveryDistance: options.deliveryDistance
  })

  const feeManager = new FeeManager()
  return feeManager.calculateOrderTotal(context)
}

/**
 * Get fee breakdown for display purposes
 */
export function getFeeBreakdownForDisplay(calculation: OrderCalculationResult) {
  return {
    subtotal: calculation.subtotal,
    fees: calculation.fees.filter(fee => fee.showInBreakdown),
    total: calculation.total,
    feeSummary: calculation.fees.reduce((acc, fee) => {
      if (!acc[fee.type]) {
        acc[fee.type] = { amount: 0, count: 0, displayName: fee.displayName }
      }
      acc[fee.type].amount += fee.amount
      acc[fee.type].count += 1
      return acc
    }, {} as Record<string, { amount: number; count: number; displayName: string }>)
  }
}

/**
 * Validate order calculation against stored values
 */
export function validateOrderCalculation(
  storedOrder: {
    subtotal: number
    deliveryFee: number
    tax: number
    total: number
  },
  calculatedOrder: OrderCalculationResult,
  tolerance: number = 1 // Allow 1 cent tolerance for rounding differences
): { valid: boolean; discrepancies: string[] } {
  const discrepancies: string[] = []

  if (Math.abs(storedOrder.subtotal - calculatedOrder.subtotal) > tolerance) {
    discrepancies.push(`Subtotal mismatch: stored ${storedOrder.subtotal}, calculated ${calculatedOrder.subtotal}`)
  }

  const calculatedDeliveryFee = calculatedOrder.fees
    .filter(fee => fee.type === 'delivery')
    .reduce((sum, fee) => sum + fee.amount, 0)

  if (Math.abs(storedOrder.deliveryFee - calculatedDeliveryFee) > tolerance) {
    discrepancies.push(`Delivery fee mismatch: stored ${storedOrder.deliveryFee}, calculated ${calculatedDeliveryFee}`)
  }

  const calculatedTax = calculatedOrder.fees
    .filter(fee => fee.type === 'tax')
    .reduce((sum, fee) => sum + fee.amount, 0)

  if (Math.abs(storedOrder.tax - calculatedTax) > tolerance) {
    discrepancies.push(`Tax mismatch: stored ${storedOrder.tax}, calculated ${calculatedTax}`)
  }

  if (Math.abs(storedOrder.total - calculatedOrder.total) > tolerance) {
    discrepancies.push(`Total mismatch: stored ${storedOrder.total}, calculated ${calculatedOrder.total}`)
  }

  return {
    valid: discrepancies.length === 0,
    discrepancies
  }
}
