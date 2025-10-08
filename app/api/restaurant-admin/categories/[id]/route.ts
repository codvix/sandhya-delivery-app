import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || (session.role !== "RESTAURANT_OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, icon, order } = await request.json()

    const category = await prisma.category.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order })
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Failed to update category:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || (session.role !== "RESTAURANT_OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if category has menu items
    const menuItemsCount = await prisma.menuItem.count({
      where: { categoryId: id }
    })

    if (menuItemsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing menu items" },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
