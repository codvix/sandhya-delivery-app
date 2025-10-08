/**
 * Fee Manager Initialization
 * 
 * This file handles the initialization of the fee manager with custom configuration.
 * It prevents circular dependency issues by loading the custom config after the manager is created.
 */

import { FeeManager } from './manager'

// Create the default fee manager instance
export const feeManager = new FeeManager()

// Function to load custom configuration
export function loadCustomConfiguration(): void {
  try {
    // Dynamically import the custom config to avoid circular dependencies
    import('./custom-config').then(({ CURRENT_FEE_CONFIG }) => {
      feeManager.updateConfiguration(CURRENT_FEE_CONFIG)
    }).catch((error) => {
      console.warn('Failed to load custom fee configuration, using default:', error)
    })
  } catch (error) {
    console.warn('Failed to load custom fee configuration, using default:', error)
  }
}

// Initialize with custom configuration if available
if (typeof window !== 'undefined') {
  // Only run on client side
  loadCustomConfiguration()
}
