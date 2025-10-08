// @ts-nocheck

// Main classes
export { FeeManager } from './manager'
export { feeManager, loadCustomConfiguration } from './init'
export { FeeCalculator } from './calculator'

// Types
export type {
  FeeType,
  FeeCalculationMethod,
  FeeConfig,
  FeeTier,
  FeeCondition,
  FeeCalculationContext,
  FeeResult,
  OrderCalculationResult,
  FeeConfiguration
} from './types'

// Configuration and presets
export {
  DEFAULT_FEE_CONFIGURATION,
  DEFAULT_FEE_CONFIGS,
  FEE_PRESETS,
  getPresetConfiguration,
  createCustomConfiguration
} from './config'

// Utility functions for common use cases
export function createOrderContext(
  subtotal: number,
  options: {
    restaurantId?: string
    deliveryLevel?: 'STANDARD' | 'EXPRESS' | 'PRIORITY'
    paymentMethod?: string
    userType?: 'regular' | 'premium' | 'vip'
    orderTime?: Date
    deliveryDistance?: number
    customData?: Record<string, any>
  } = {}
): import('./types').FeeCalculationContext {
  return {
    subtotal,
    restaurantId: options.restaurantId,
    deliveryLevel: options.deliveryLevel,
    paymentMethod: options.paymentMethod,
    userType: options.userType,
    orderTime: options.orderTime || new Date(),
    deliveryDistance: options.deliveryDistance,
    customData: options.customData
  }
}

// Quick calculation functions using local fee manager instances
export function calculateOrderTotal(
  subtotal: number,
  context?: Partial<import('./types').FeeCalculationContext>
): import('./types').OrderCalculationResult {
  const fullContext = createOrderContext(subtotal, context || {})
  const manager = new FeeManager()
  return manager.calculateOrderTotal(fullContext)
}

export function getDeliveryFee(
  subtotal: number,
  deliveryLevel: 'STANDARD' | 'EXPRESS' | 'PRIORITY' = 'STANDARD'
): number {
  const context = createOrderContext(subtotal, { deliveryLevel })
  const manager = new FeeManager()
  return manager.getDeliveryFee(context)
}

export function getTaxAmount(subtotal: number): number {
  const context = createOrderContext(subtotal)
  const manager = new FeeManager()
  return manager.getTaxAmount(context)
}

// Order utilities
export {
  calculateCartTotals,
  calculateOrderTotals,
  getFeeBreakdownForDisplay,
  validateOrderCalculation
} from './order-utils'
