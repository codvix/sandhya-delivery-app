/**
 * Fee Manager - Main interface for fee management
 * 
 * This is the main class that provides a simple interface for
 * managing fees throughout the application.
 */

import { FeeCalculator } from './calculator'
import { FeeConfiguration, FeeConfig, FeeCalculationContext, OrderCalculationResult } from './types'
import { DEFAULT_FEE_CONFIGURATION, getPresetConfiguration } from './config'

export class FeeManager {
  private calculator: FeeCalculator
  private configuration: FeeConfiguration

  constructor(configuration?: FeeConfiguration) {
    this.configuration = configuration || DEFAULT_FEE_CONFIGURATION
    this.calculator = new FeeCalculator(this.configuration.fees)
  }

  /**
   * Calculate order total with all applicable fees
   */
  calculateOrderTotal(context: FeeCalculationContext): OrderCalculationResult {
    return this.calculator.calculateFees(context)
  }

  /**
   * Get just the delivery fee for an order
   */
  getDeliveryFee(context: FeeCalculationContext): number {
    const result = this.calculator.calculateFees(context)
    const deliveryFees = result.fees.filter(fee => fee.type === 'delivery')
    return deliveryFees.reduce((sum, fee) => sum + fee.amount, 0)
  }

  /**
   * Get just the tax amount for an order
   */
  getTaxAmount(context: FeeCalculationContext): number {
    const result = this.calculator.calculateFees(context)
    const taxFees = result.fees.filter(fee => fee.type === 'tax')
    return taxFees.reduce((sum, fee) => sum + fee.amount, 0)
  }

  /**
   * Get all fees of a specific type
   */
  getFeesByType(context: FeeCalculationContext, type: string): number {
    const result = this.calculator.calculateFees(context)
    const feesOfType = result.fees.filter(fee => fee.type === type)
    return feesOfType.reduce((sum, fee) => sum + fee.amount, 0)
  }

  /**
   * Get fee breakdown for display
   */
  getFeeBreakdown(context: FeeCalculationContext) {
    const result = this.calculator.calculateFees(context)
    return {
      subtotal: result.subtotal,
      fees: result.fees.filter(fee => fee.showInBreakdown),
      total: result.total
    }
  }

  /**
   * Update fee configuration
   */
  updateConfiguration(newConfiguration: FeeConfiguration): void {
    this.configuration = newConfiguration
    this.calculator = new FeeCalculator(newConfiguration.fees)
  }

  /**
   * Update a specific fee config
   */
  updateFeeConfig(feeConfig: FeeConfig): void {
    this.calculator.updateConfig(feeConfig)
    
    // Update the main configuration
    const index = this.configuration.fees.findIndex(f => f.id === feeConfig.id)
    if (index !== -1) {
      this.configuration.fees[index] = feeConfig
    }
  }

  /**
   * Enable/disable a fee
   */
  toggleFee(feeId: string, enabled: boolean): void {
    const config = this.calculator.getFeeConfig(feeId)
    if (config) {
      const updatedConfig = { ...config, enabled }
      this.updateFeeConfig(updatedConfig)
    }
  }

  /**
   * Get current configuration
   */
  getConfiguration(): FeeConfiguration {
    return { ...this.configuration }
  }

  /**
   * Get all fee configurations
   */
  getAllFeeConfigs(): FeeConfig[] {
    return this.calculator.getAllConfigs()
  }

  /**
   * Get enabled fee configurations
   */
  getEnabledFeeConfigs(): FeeConfig[] {
    return this.calculator.getAllConfigs().filter(config => config.enabled)
  }

  /**
   * Load configuration from preset
   */
  loadPreset(presetName: keyof typeof import('./config').FEE_PRESETS): void {
    const presetConfig = getPresetConfiguration(presetName)
    this.updateConfiguration(presetConfig)
  }

  /**
   * Export current configuration
   */
  exportConfiguration(): string {
    return JSON.stringify(this.configuration, null, 2)
  }

  /**
   * Import configuration from JSON
   */
  importConfiguration(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson) as FeeConfiguration
      this.updateConfiguration(config)
      return true
    } catch (error) {
      console.error('Failed to import configuration:', error)
      return false
    }
  }

  /**
   * Validate configuration
   */
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const configs = this.configuration.fees

    // Check for duplicate IDs
    const ids = configs.map(c => c.id)
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate fee IDs found: ${duplicateIds.join(', ')}`)
    }

    // Check for missing required fields
    for (const config of configs) {
      if (!config.id || !config.name || !config.type || !config.method) {
        errors.push(`Fee config ${config.id || 'unknown'} is missing required fields`)
      }

      // Validate method-specific fields
      if (config.method === 'fixed' && config.amount === undefined) {
        errors.push(`Fee config ${config.id} with 'fixed' method must have amount`)
      }

      if (config.method === 'percentage' && config.percentage === undefined) {
        errors.push(`Fee config ${config.id} with 'percentage' method must have percentage`)
      }

      if (config.method === 'tiered' && (!config.tiers || config.tiers.length === 0)) {
        errors.push(`Fee config ${config.id} with 'tiered' method must have tiers`)
      }

      if (config.method === 'conditional' && (!config.conditions || config.conditions.length === 0)) {
        errors.push(`Fee config ${config.id} with 'conditional' method must have conditions`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Create a default instance for easy importing
export const feeManager = new FeeManager()
