/**
 * Fee Configuration - Default configurations and presets
 * 
 * This file contains default fee configurations that can be easily
 * customized for different business needs.
 */

import { FeeConfiguration, FeeConfig } from './types'

/**
 * Default fee configurations for the food delivery app
 */
export const DEFAULT_FEE_CONFIGS: FeeConfig[] = [
  {
    id: 'delivery_fee_standard',
    name: 'Delivery Fee (Standard)',
    type: 'delivery',
    method: 'conditional',
    enabled: false,
    priority: 1,
    displayName: 'Delivery Fee',
    description: 'Standard delivery charge',
    showInBreakdown: true,
    conditions: [
      {
        field: 'deliveryLevel',
        operator: 'equals',
        value: 'STANDARD',
        amount: 500 // ₹5.00
      },
      {
        field: 'deliveryLevel',
        operator: 'equals',
        value: 'EXPRESS',
        amount: 800 // ₹8.00
      },
      {
        field: 'deliveryLevel',
        operator: 'equals',
        value: 'PRIORITY',
        amount: 1200 // ₹12.00
      }
    ],
    minAmount: 0,
    maxAmount: 2000 // ₹20.00 max
  },
  {
    id: 'tax_gst',
    name: 'GST Tax',
    type: 'tax',
    method: 'percentage',
    enabled: false,
    priority: 2,
    percentage: 10, // 10% GST
    displayName: 'Tax (GST)',
    description: 'Goods and Services Tax',
    showInBreakdown: true,
    minAmount: 0
  },
  {
    id: 'service_charge',
    name: 'Service Charge',
    type: 'service',
    method: 'percentage',
    enabled: false, // Disabled by default
    priority: 3,
    percentage: 0, // 5% service charge
    displayName: 'Service Charge',
    description: 'Restaurant service charge',
    showInBreakdown: true,
    minAmount: 0,
    maxAmount: 1000 // ₹10.00 max
  },
  {
    id: 'platform_fee',
    name: 'Platform Fee',
    type: 'platform',
    method: 'tiered',
    enabled: false, // Disabled by default
    priority: 4,
    displayName: 'Platform Fee',
    description: 'Platform usage fee',
    showInBreakdown: true,
    tiers: [
      {
        minOrderValue: 0,
        maxOrderValue: 1000, // ₹10.00
        amount: 50 // ₹0.50
      },
      {
        minOrderValue: 1000,
        maxOrderValue: 5000, // ₹50.00
        amount: 100 // ₹1.00
      },
      {
        minOrderValue: 5000,
        amount: 200 // ₹2.00
      }
    ]
  },
  {
    id: 'packaging_fee',
    name: 'Packaging Fee',
    type: 'packaging',
    method: 'fixed',
    enabled: false, // Disabled by default
    priority: 5,
    amount: 50, // ₹0.50
    displayName: 'Packaging Fee',
    description: 'Eco-friendly packaging charge',
    showInBreakdown: true,
    minAmount: 0,
    maxAmount: 100 // ₹1.00 max
  },
  {
    id: 'free_delivery_threshold',
    name: 'Free Delivery Threshold',
    type: 'delivery',
    method: 'conditional',
    enabled: true,
    priority: 0, // Highest priority - check first
    displayName: 'Delivery Fee',
    description: 'Free delivery for orders ≥₹199',
    showInBreakdown: true,
    conditions: [
      {
        field: 'subtotal',
        operator: 'greater_than',
        value: 19899, // ₹199.00 (19900 cents - 1)
        amount: 0 // Free delivery
      }
    ]
  },
  {
    id: 'distance_based_delivery',
    name: 'Distance-Based Delivery Fee',
    type: 'delivery',
    method: 'conditional',
    enabled: true,
    priority: 1, // Second priority
    displayName: 'Delivery Fee',
    description: 'Distance-based delivery charge: ₹10 base + ₹10 per km for orders <₹199',
    showInBreakdown: true,
    conditions: [
      {
        field: 'deliveryDistance',
        operator: 'greater_than',
        value: 0,
        amount: 0 // Will be calculated dynamically
      }
    ]
  }
]

/**
 * Default global settings
 */
export const DEFAULT_GLOBAL_SETTINGS = {
  currency: 'INR',
  roundingMethod: 'round' as const,
  displayPrecision: 2
}

/**
 * Complete default configuration
 */
export const DEFAULT_FEE_CONFIGURATION: FeeConfiguration = {
  version: '1.0.0',
  lastUpdated: new Date(),
  fees: DEFAULT_FEE_CONFIGS,
  globalSettings: DEFAULT_GLOBAL_SETTINGS
}

/**
 * Preset configurations for different business models
 */
export const FEE_PRESETS = {
  // Basic configuration - minimal fees
  BASIC: {
    name: 'Basic',
    description: 'Minimal fees - just delivery and tax',
    configs: DEFAULT_FEE_CONFIGS.filter(fee => 
      ['delivery_fee_standard', 'tax_gst', 'free_delivery_threshold'].includes(fee.id)
    )
  },

  // Premium configuration - includes service charges
  PREMIUM: {
    name: 'Premium',
    description: 'Includes service charges and platform fees',
    configs: DEFAULT_FEE_CONFIGS.filter(fee => 
      !['packaging_fee'].includes(fee.id)
    ).map(fee => ({
      ...fee,
      enabled: ['delivery_fee_standard', 'tax_gst', 'free_delivery_threshold', 'service_charge'].includes(fee.id)
    }))
  },

  // Full configuration - all fees enabled
  FULL: {
    name: 'Full',
    description: 'All available fees enabled',
    configs: DEFAULT_FEE_CONFIGS.map(fee => ({
      ...fee,
      enabled: true
    }))
  },

  // Restaurant-specific configuration
  RESTAURANT_OWNED: {
    name: 'Restaurant Owned',
    description: 'For restaurants that handle their own delivery',
    configs: DEFAULT_FEE_CONFIGS.filter(fee => 
      !['delivery_fee_standard', 'free_delivery_threshold'].includes(fee.id)
    ).map(fee => ({
      ...fee,
      enabled: ['tax_gst', 'service_charge'].includes(fee.id)
    }))
  }
}

/**
 * Get configuration by preset name
 */
export function getPresetConfiguration(presetName: keyof typeof FEE_PRESETS): FeeConfiguration {
  const preset = FEE_PRESETS[presetName]
  return {
    version: '1.0.0',
    lastUpdated: new Date(),
    fees: preset.configs,
    globalSettings: DEFAULT_GLOBAL_SETTINGS
  }
}

/**
 * Create custom configuration
 */
export function createCustomConfiguration(
  enabledFeeIds: string[],
  customConfigs?: Partial<FeeConfig>[]
): FeeConfiguration {
  const configs = DEFAULT_FEE_CONFIGS.map(fee => {
    const isEnabled = enabledFeeIds.includes(fee.id)
    const customConfig = customConfigs?.find(c => c.id === fee.id)
    
    return {
      ...fee,
      ...customConfig,
      enabled: isEnabled
    }
  })

  return {
    version: '1.0.0',
    lastUpdated: new Date(),
    fees: configs,
    globalSettings: DEFAULT_GLOBAL_SETTINGS
  }
}
