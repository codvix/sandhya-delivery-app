// Performance optimization utilities

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

export function lazyLoad<T>(
  importFunc: () => Promise<{ default: T }>
): () => Promise<T> {
  let promise: Promise<T> | null = null
  
  return () => {
    if (!promise) {
      promise = importFunc().then(module => module.default)
    }
    return promise
  }
}

// Image optimization utilities
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!src) return src
  
  // If it's already an optimized URL, return as is
  if (src.includes('_next/image') || src.includes('vercel.app')) {
    return src
  }
  
  // For external images, you might want to use a service like Cloudinary or ImageKit
  // For now, return the original URL
  return src
}

// Cache utilities
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>()
  
  set(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    })
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
}

// API response caching
export const apiCache = new SimpleCache<any>()

// Database query optimization helpers
export function buildWhereClause(filters: Record<string, any>) {
  const where: any = {}
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' && value.includes('*')) {
        // Handle wildcard searches
        where[key] = {
          contains: value.replace(/\*/g, ''),
          mode: 'insensitive'
        }
      } else if (Array.isArray(value)) {
        where[key] = {
          in: value
        }
      } else {
        where[key] = value
      }
    }
  })
  
  return where
}

// Pagination helpers
export function buildPaginationParams(
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit
  return {
    skip,
    take: limit
  }
}

// Search optimization
export function buildSearchQuery(searchTerm: string, fields: string[]) {
  if (!searchTerm) return {}
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const
      }
    }))
  }
}
