/**
 * Custom Fee Configuration
 * 
 * This file allows you to easily customize fee settings for your application.
 * Modify the values here to change how fees are calculated.
 * 
 * IMPORTANT: After making changes, restart your application for the changes to take effect.
 */

import { FeeConfiguration, FeeConfig } from './types'

/**
 * CUSTOM FEE CONFIGURATION
 * 
 * Uncomment and modify the sections below to customize your fee structure.
 * You can also create multiple configurations for different scenarios.
 */

// Example: Basic configuration with just delivery and tax
export const BASIC_FEE_CONFIG: FeeConfiguration = {
  version: '1.0.0',
  lastUpdated: new Date(),
  fees: [
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
          amount: 0 // ₹5.00 - Change this amount
        },
        {
          field: 'deliveryLevel',
          operator: 'equals',
          value: 'EXPRESS',
          amount: 0 // ₹8.00 - Change this amount
        },
        {
          field: 'deliveryLevel',
          operator: 'equals',
          value: 'PRIORITY',
          amount: 1200 // ₹12.00 - Change this amount
        }
      ],
      minAmount: 0,
      maxAmount: 2000 // ₹20.00 max
    },
    {
      id: 'free_delivery_threshold',
      name: 'Free Delivery Threshold',
      type: 'delivery',
      method: 'conditional',
      enabled: false,
      priority: 0, // Check this first
      displayName: 'Delivery Fee',
      description: 'Free delivery for orders above threshold',
      showInBreakdown: true,
      conditions: [
        {
          field: 'subtotal',
          operator: 'greater_than',
          value: 0, // ₹20.00 - Change this threshold
          amount: 0 // Free delivery
        }
      ]
    },
    {
      id: 'tax_gst',
      name: 'GST Tax',
      type: 'tax',
      method: 'percentage',
      enabled: false,
      priority: 2,
      percentage: 0, // 10% - Change this percentage
      displayName: 'Tax (GST)',
      description: 'Goods and Services Tax',
      showInBreakdown: true,
      minAmount: 0
    }
  ],
  globalSettings: {
    currency: 'INR',
    roundingMethod: 'round',
    displayPrecision: 2
  }
}

// Example: Premium configuration with additional fees
export const PREMIUM_FEE_CONFIG: FeeConfiguration = {
  version: '1.0.0',
  lastUpdated: new Date(),
  fees: [
   
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
          amount: 500
        },
        {
          field: 'deliveryLevel',
          operator: 'equals',
          value: 'EXPRESS',
          amount: 800
        },
        {
          field: 'deliveryLevel',
          operator: 'equals',
          value: 'PRIORITY',
          amount: 1200
        }
      ]
    },
    {
      id: 'free_delivery_threshold',
      name: 'Free Delivery Threshold',
      type: 'delivery',
      method: 'conditional',
      enabled: false,
      priority: 0,
      displayName: 'Delivery Fee',
      description: 'Free delivery for orders above threshold',
      showInBreakdown: true,
      conditions: [
        {
          field: 'subtotal',
          operator: 'greater_than',
          value: 2000,
          amount: 0
        }
      ]
    },
    {
      id: 'tax_gst',
      name: 'GST Tax',
      type: 'tax',
      method: 'percentage',
      enabled: false,
      priority: 2,
      percentage: 10,
      displayName: 'Tax (GST)',
      description: 'Goods and Services Tax',
      showInBreakdown: true,
      minAmount: 0
    },
    // Additional fees for premium configuration
    {
      id: 'service_charge',
      name: 'Service Charge',
      type: 'service',
      method: 'percentage',
      enabled: false, // Enable this for premium
      priority: 3,
      percentage: 5, // 5% service charge
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
      enabled: false, // Enable this for premium
      priority: 4,
      displayName: 'Platform Fee',
      description: 'Platform usage fee',
      showInBreakdown: true,
      tiers: [
        {
          minOrderValue: 0,
          maxOrderValue: 1000,
          amount: 50 // ₹0.50
        },
        {
          minOrderValue: 1000,
          maxOrderValue: 5000,
          amount: 100 // ₹1.00
        },
        {
          minOrderValue: 5000,
          amount: 200 // ₹2.00
        }
      ]
    }
  ],
  globalSettings: {
    currency: 'INR',
    roundingMethod: 'round',
    displayPrecision: 2
  }
}

/**
 * CURRENT CONFIGURATION
 * 
 * Change this to use different configurations:
 * - BASIC_FEE_CONFIG: Minimal fees (delivery + tax)
 * - PREMIUM_FEE_CONFIG: Additional service and platform fees
 * - Or create your own custom configuration
 */
export const CURRENT_FEE_CONFIG = BASIC_FEE_CONFIG

/**
 * QUICK CUSTOMIZATION GUIDE
 * 
 * 1. To change delivery fees:
 *    - Modify the 'amount' values in the delivery fee conditions
 * 
 * 2. To change tax rate:
 *    - Modify the 'percentage' value in the tax_gst config
 * 
 * 3. To change free delivery threshold:
 *    - Modify the 'value' in the free_delivery_threshold condition
 * 
 * 4. To add new fees:
 *    - Add new fee configurations to the fees array
 *    - Set appropriate priority (lower numbers are calculated first)
 * 
 * 5. To enable/disable fees:
 *    - Set 'enabled' to true/false for any fee
 * 
 * 6. To change currency:
 *    - Modify the 'currency' in globalSettings
 */
