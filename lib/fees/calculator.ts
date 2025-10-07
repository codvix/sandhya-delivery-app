/**
 * Fee Calculator - Core calculation engine
 * 
 * Handles the calculation of various fees based on configuration
 * and order context.
 */

import { 
  FeeConfig, 
  FeeCalculationContext, 
  FeeResult, 
  OrderCalculationResult,
  FeeCalculationMethod 
} from './types'
import { calculateDeliveryFee } from '../utils/distance'

export class FeeCalculator {
  private configs: FeeConfig[]

  constructor(configs: FeeConfig[]) {
    this.configs = configs
      .filter(config => config.enabled)
      .sort((a, b) => a.priority - b.priority)
  }

  /**
   * Calculate all applicable fees for an order
   */
  calculateFees(context: FeeCalculationContext): OrderCalculationResult {
    const fees: FeeResult[] = []
    let runningTotal = context.subtotal

    for (const config of this.configs) {
      const feeResult = this.calculateFee(config, context, runningTotal)
      
      if (feeResult.applied) {
        fees.push(feeResult)
        runningTotal += feeResult.amount
      }
    }

    return {
      subtotal: context.subtotal,
      fees,
      total: runningTotal,
      breakdown: {
        subtotal: context.subtotal,
        fees,
        total: runningTotal
      }
    }
  }

  /**
   * Calculate a single fee based on its configuration
   */
  private calculateFee(
    config: FeeConfig, 
    context: FeeCalculationContext, 
    currentTotal: number
  ): FeeResult {
    // Check if order meets minimum/maximum value requirements
    if (config.minOrderValue && context.subtotal < config.minOrderValue) {
      return this.createFeeResult(config, 0, false, `Order value below minimum (${config.minOrderValue})`)
    }

    if (config.maxOrderValue && context.subtotal > config.maxOrderValue) {
      return this.createFeeResult(config, 0, false, `Order value above maximum (${config.maxOrderValue})`)
    }

    let amount = 0
    let applied = false
    let reason = ''

    switch (config.method) {
      case 'fixed':
        amount = config.amount || 0
        applied = amount > 0
        reason = applied ? `Fixed fee of ${amount} cents` : 'Fixed fee is zero'
        break

      case 'percentage':
        if (config.percentage) {
          amount = Math.round(context.subtotal * (config.percentage / 100))
          applied = amount > 0
          reason = applied ? `${config.percentage}% of subtotal` : 'Percentage calculation resulted in zero'
        }
        break

      case 'tiered':
        const tierResult = this.calculateTieredFee(config, context)
        amount = tierResult.amount
        applied = tierResult.applied
        reason = tierResult.reason
        break

      case 'conditional':
        const conditionalResult = this.calculateConditionalFee(config, context)
        amount = conditionalResult.amount
        applied = conditionalResult.applied
        reason = conditionalResult.reason
        break

      default:
        reason = `Unknown calculation method: ${config.method}`
    }

    // Apply min/max amount constraints
    if (applied && config.minAmount && amount < config.minAmount) {
      amount = config.minAmount
      reason += ` (adjusted to minimum ${config.minAmount})`
    }

    if (applied && config.maxAmount && amount > config.maxAmount) {
      amount = config.maxAmount
      reason += ` (adjusted to maximum ${config.maxAmount})`
    }

    return this.createFeeResult(config, amount, applied, reason)
  }

  /**
   * Calculate tiered fee based on order value
   */
  private calculateTieredFee(config: FeeConfig, context: FeeCalculationContext) {
    if (!config.tiers || config.tiers.length === 0) {
      return { amount: 0, applied: false, reason: 'No tiers configured' }
    }

    // Find the appropriate tier
    const applicableTier = config.tiers.find(tier => {
      const meetsMin = context.subtotal >= tier.minOrderValue
      const meetsMax = !tier.maxOrderValue || context.subtotal <= tier.maxOrderValue
      return meetsMin && meetsMax
    })

    if (!applicableTier) {
      return { amount: 0, applied: false, reason: 'No applicable tier found' }
    }

    let amount = 0
    if (applicableTier.amount) {
      amount = applicableTier.amount
    } else if (applicableTier.percentage) {
      amount = Math.round(context.subtotal * (applicableTier.percentage / 100))
    }

    return {
      amount,
      applied: amount > 0,
      reason: `Tiered fee: ${applicableTier.minOrderValue}-${applicableTier.maxOrderValue || '∞'}`
    }
  }

  /**
   * Calculate conditional fee based on specific conditions
   */
  private calculateConditionalFee(config: FeeConfig, context: FeeCalculationContext) {
    if (!config.conditions || config.conditions.length === 0) {
      return { amount: 0, applied: false, reason: 'No conditions configured' }
    }

    // Special handling for distance-based delivery fee
    if (config.id === 'distance_based_delivery' && context.deliveryDistance !== undefined) {
      const amount = calculateDeliveryFee(context.deliveryDistance, context.subtotal)
      return {
        amount,
        applied: amount > 0,
        reason: `Distance-based delivery: ${context.deliveryDistance}km, order value: ₹${(context.subtotal / 100).toFixed(2)}`
      }
    }

    // Check if any condition is met
    for (const condition of config.conditions) {
      if (this.evaluateCondition(condition, context)) {
        let amount = 0
        if (condition.amount) {
          amount = condition.amount
        } else if (condition.percentage) {
          amount = Math.round(context.subtotal * (condition.percentage / 100))
        }

        return {
          amount,
          applied: amount > 0,
          reason: `Condition met: ${condition.field} ${condition.operator} ${condition.value}`
        }
      }
    }

    return { amount: 0, applied: false, reason: 'No conditions met' }
  }

  /**
   * Evaluate a single condition against the context
   */
  private evaluateCondition(condition: any, context: FeeCalculationContext): boolean {
    const fieldValue = this.getFieldValue(condition.field, context)

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'not_equals':
        return fieldValue !== condition.value
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value)
      case 'less_than':
        return Number(fieldValue) < Number(condition.value)
      default:
        return false
    }
  }

  /**
   * Get field value from context
   */
  private getFieldValue(field: string, context: FeeCalculationContext): any {
    switch (field) {
      case 'subtotal':
        return context.subtotal
      case 'restaurantId':
        return context.restaurantId
      case 'deliveryLevel':
        return context.deliveryLevel
      case 'paymentMethod':
        return context.paymentMethod
      case 'userType':
        return context.userType
      case 'orderTime':
        return context.orderTime
      case 'deliveryDistance':
        return context.deliveryDistance
      case 'userLocation':
        return context.userLocation
      case 'restaurantLocation':
        return context.restaurantLocation
      default:
        return context.customData?.[field]
    }
  }

  /**
   * Create a fee result object
   */
  private createFeeResult(
    config: FeeConfig, 
    amount: number, 
    applied: boolean, 
    reason: string
  ): FeeResult {
    return {
      id: config.id,
      name: config.name,
      type: config.type,
      amount,
      method: config.method,
      displayName: config.displayName || config.name,
      description: config.description,
      showInBreakdown: config.showInBreakdown !== false,
      applied,
      reason
    }
  }

  /**
   * Get fee configuration by ID
   */
  getFeeConfig(id: string): FeeConfig | undefined {
    return this.configs.find(config => config.id === id)
  }

  /**
   * Get all fee configurations
   */
  getAllConfigs(): FeeConfig[] {
    return [...this.configs]
  }

  /**
   * Update fee configuration
   */
  updateConfig(updatedConfig: FeeConfig): void {
    const index = this.configs.findIndex(config => config.id === updatedConfig.id)
    if (index !== -1) {
      this.configs[index] = updatedConfig
      // Re-sort by priority
      this.configs.sort((a, b) => a.priority - b.priority)
    }
  }
}
