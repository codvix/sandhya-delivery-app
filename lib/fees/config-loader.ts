/**
 * Configuration Loader
 * 
 * This file provides utilities to load and apply custom fee configurations
 * without causing circular dependency issues.
 */

import { FeeManager } from './manager'
import { FeeConfiguration } from './types'

/**
 * Load custom configuration and apply it to a fee manager
 */
export async function loadCustomConfigForManager(manager: FeeManager): Promise<void> {
  try {
    const { CURRENT_FEE_CONFIG } = await import('./custom-config')
    manager.updateConfiguration(CURRENT_FEE_CONFIG)
  } catch (error) {
    console.warn('Failed to load custom fee configuration:', error)
  }
}

/**
 * Create a fee manager with custom configuration
 */
export async function createFeeManagerWithCustomConfig(): Promise<FeeManager> {
  const manager = new FeeManager()
  await loadCustomConfigForManager(manager)
  return manager
}

/**
 * Get the current custom configuration
 */
export async function getCurrentCustomConfig(): Promise<FeeConfiguration | null> {
  try {
    const { CURRENT_FEE_CONFIG } = await import('./custom-config')
    return CURRENT_FEE_CONFIG
  } catch (error) {
    console.warn('Failed to load custom fee configuration:', error)
    return null
  }
}
