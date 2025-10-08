import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiCache, buildWhereClause, buildPaginationParams, buildSearchQuery } from "@/lib/performance"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const isOpen = searchParams.get('isOpen')
    const cuisine = searchParams.get('cuisine')
    
    // Build cache key
    const cacheKey = `restaurants:${search}:${page}:${limit}:${isOpen}:${cuisine}`
    
    // Check cache first
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }
    
    // Build query filters
    const filters = buildWhereClause({
      isOpen: isOpen === 'true' ? true : isOpen === 'false' ? false : undefined,
      cuisines: cuisine ? { contains: cuisine, mode: 'insensitive' } : undefined
    })
    
    // Build search query
    const searchQuery = buildSearchQuery(search, ['name', 'description', 'cuisines'])
    
    // Combine filters and search
    const where = {
      ...filters,
      ...(Object.keys(searchQuery).length > 0 ? searchQuery : {})
    }
    
    // Build pagination
    const pagination = buildPaginationParams(page, limit)
    
    // Execute optimized query
    const [restaurants, totalCount] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        ...pagination,
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          rating: true,
          totalRatings: true,
          deliveryTime: true,
          costForTwo: true,
          cuisines: true,
          isOpen: true,
          address: true,
          _count: {
            select: {
              menuItems: {
                where: { isAvailable: true }
              }
            }
          }
        },
        orderBy: [
          { isOpen: 'desc' },
          { rating: 'desc' },
          { totalRatings: 'desc' }
        ]
      }),
      prisma.restaurant.count({ where })
    ])
    
    const result = {
      restaurants,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    }
    
    // Cache for 5 minutes
    apiCache.set(cacheKey, result, 5 * 60 * 1000)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch restaurants:", error)
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    )
  }
}
