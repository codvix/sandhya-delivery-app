# Fee Management Library

A flexible and configurable system for managing various types of fees, taxes, and charges in the food delivery application.

## Features

- **Multiple Fee Types**: Support for delivery fees, taxes, service charges, platform fees, packaging fees, tips, discounts, and surcharges
- **Flexible Calculation Methods**: Fixed amounts, percentages, tiered pricing, and conditional fees
- **Easy Configuration**: Simple configuration files for quick customization
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Validation**: Built-in validation for configurations and calculations
- **Presets**: Pre-configured setups for different business models

## Quick Start

### Basic Usage

```typescript
import { calculateOrderTotal, getDeliveryFee, getTaxAmount } from '@/lib/fees'

// Calculate total order amount
const subtotal = 1500 // ₹15.00 in cents
const calculation = calculateOrderTotal(subtotal, {
  deliveryLevel: 'STANDARD',
  restaurantId: 'restaurant-123'
})

console.log(calculation.total) // Total amount including all fees

// Get specific fees
const deliveryFee = getDeliveryFee(subtotal, 'STANDARD')
const tax = getTaxAmount(subtotal)
```

### Advanced Usage

```typescript
import { feeManager, createOrderContext } from '@/lib/fees'

// Create detailed context
const context = createOrderContext(1500, {
  restaurantId: 'restaurant-123',
  deliveryLevel: 'EXPRESS',
  paymentMethod: 'CARD',
  userType: 'premium',
  orderTime: new Date(),
  deliveryDistance: 2.5
})

// Calculate with full context
const result = feeManager.calculateOrderTotal(context)

// Get fee breakdown
const breakdown = feeManager.getFeeBreakdown(context)
console.log(breakdown.fees) // Array of applied fees
```

## Configuration

### Quick Customization

Edit `lib/fees/custom-config.ts` to modify fee settings:

```typescript
// Change delivery fee amounts
amount: 500 // ₹5.00 - Change this amount

// Change tax percentage
percentage: 10 // 10% - Change this percentage

// Change free delivery threshold
value: 2000 // ₹20.00 - Change this threshold

// Enable/disable fees
enabled: true // Set to false to disable
```

### Available Configurations

1. **BASIC_FEE_CONFIG**: Minimal fees (delivery + tax)
2. **PREMIUM_FEE_CONFIG**: Additional service and platform fees
3. **Custom configurations**: Create your own

### Switching Configurations

```typescript
// In custom-config.ts
export const CURRENT_FEE_CONFIG = PREMIUM_FEE_CONFIG // or BASIC_FEE_CONFIG
```

## Fee Types

### Delivery Fees
- Standard delivery charges
- Express delivery premiums
- Free delivery thresholds
- Distance-based pricing

### Taxes
- GST/VAT calculations
- Percentage-based taxes
- Fixed tax amounts

### Service Charges
- Restaurant service fees
- Platform usage fees
- Packaging charges

### Conditional Fees
- Time-based pricing
- Payment method surcharges
- User type discounts
- Restaurant-specific fees

## Calculation Methods

### Fixed Amount
```typescript
{
  method: 'fixed',
  amount: 500 // ₹5.00
}
```

### Percentage
```typescript
{
  method: 'percentage',
  percentage: 10 // 10% of subtotal
}
```

### Tiered Pricing
```typescript
{
  method: 'tiered',
  tiers: [
    { minOrderValue: 0, maxOrderValue: 1000, amount: 50 },
    { minOrderValue: 1000, maxOrderValue: 5000, amount: 100 },
    { minOrderValue: 5000, amount: 200 }
  ]
}
```

### Conditional
```typescript
{
  method: 'conditional',
  conditions: [
    {
      field: 'deliveryLevel',
      operator: 'equals',
      value: 'EXPRESS',
      amount: 800
    }
  ]
}
```

## API Reference

### Main Functions

- `calculateOrderTotal(subtotal, context?)`: Calculate total with all fees
- `getDeliveryFee(subtotal, deliveryLevel)`: Get delivery fee only
- `getTaxAmount(subtotal)`: Get tax amount only
- `createOrderContext(subtotal, options)`: Create calculation context

### FeeManager Class

- `calculateOrderTotal(context)`: Calculate with full context
- `getFeeBreakdown(context)`: Get display-ready breakdown
- `updateConfiguration(config)`: Update fee configuration
- `toggleFee(feeId, enabled)`: Enable/disable specific fees
- `loadPreset(presetName)`: Load predefined configuration

### Order Utilities

- `calculateCartTotals(items, options)`: Calculate for cart items
- `calculateOrderTotals(items, options)`: Calculate for order items
- `getFeeBreakdownForDisplay(calculation)`: Format for UI display
- `validateOrderCalculation(stored, calculated)`: Validate calculations

## Examples

### Restaurant-Specific Fees
```typescript
const context = createOrderContext(1500, {
  restaurantId: 'premium-restaurant-123',
  customData: {
    restaurantType: 'premium',
    hasSpecialPackaging: true
  }
})
```

### Time-Based Pricing
```typescript
const context = createOrderContext(1500, {
  orderTime: new Date('2024-01-01T22:00:00'), // Late night
  customData: {
    isLateNight: true
  }
})
```

### User Type Discounts
```typescript
const context = createOrderContext(1500, {
  userType: 'premium',
  customData: {
    loyaltyPoints: 1000,
    membershipLevel: 'gold'
  }
})
```

## Migration from Old System

The new fee system is designed to be backward compatible. Existing code will continue to work, but you can gradually migrate to use the new features:

1. **Phase 1**: Replace hardcoded calculations with fee library functions
2. **Phase 2**: Add conditional logic for different scenarios
3. **Phase 3**: Implement advanced features like tiered pricing

## Troubleshooting

### Common Issues

1. **Fees not calculating correctly**: Check if the fee is enabled in configuration
2. **Wrong delivery fee**: Verify delivery level is set correctly
3. **Tax calculation errors**: Ensure percentage values are correct (10 for 10%, not 0.1)

### Debug Mode

```typescript
const result = feeManager.calculateOrderTotal(context)
console.log(result.fees) // See all applied fees and reasons
```

### Validation

```typescript
const validation = feeManager.validateConfiguration()
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors)
}
```

## Future Enhancements

- Database-driven configuration
- Real-time fee updates
- A/B testing for fee structures
- Analytics and reporting
- Multi-currency support
- Regional tax calculations
