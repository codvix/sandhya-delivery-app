import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiCache, buildWhereClause } from "@/lib/performance"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const isVeg = searchParams.get('isVeg')
    const isAvailable = searchParams.get('isAvailable')
    
    // Build cache key
    const cacheKey = `menu:${id}:${search}:${category}:${isVeg}:${isAvailable}`
    
    // Check cache first
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }
    
    // Build filters
    const filters = buildWhereClause({
      restaurantId: id,
      categoryId: category,
      isVeg: isVeg === 'true' ? true : isVeg === 'false' ? false : undefined,
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined
    })
    
    // Build search query
    const searchQuery = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}
    
    const where = {
      ...filters,
      ...searchQuery
    }
    
    // Execute optimized query with proper relations
    const menuItems = await prisma.menuItem.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        isVeg: true,
        isAvailable: true,
        isPopular: true,
        category: {
          select: {
            id: true,
            name: true,
            order: true
          }
        }
      },
      orderBy: [
        { category: { order: 'asc' } },
        { isPopular: 'desc' },
        { name: 'asc' }
      ]
    })
    
    // Group by category for better performance
    const groupedItems = menuItems.reduce((acc, item) => {
      const categoryName = item.category.name
      if (!acc[categoryName]) {
        acc[categoryName] = {
          id: item.category.id,
          name: categoryName,
          order: item.category.order,
          menuItems: []
        }
      }
      acc[categoryName].menuItems.push({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        isPopular: item.isPopular
      })
      return acc
    }, {} as Record<string, any>)
    
    const result = Object.values(groupedItems)
    
    // Cache for 10 minutes (menu items change less frequently)
    apiCache.set(cacheKey, result, 10 * 60 * 1000)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch menu:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    )
  }
}
