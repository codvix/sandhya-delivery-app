// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const banner = await prisma.banner.findUnique({
      where: { id: id }
    })

    if (!banner) {
      return NextResponse.json(
        { error: "Banner not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(banner)
  } catch (error) {
    console.error("Failed to fetch banner:", error)
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { title, description, image, link, isActive, order } = await request.json()

    const banner = await prisma.banner.update({
      where: { id: id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(image && { image }),
        ...(link !== undefined && { link }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order })
      }
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error("Failed to update banner:", error)
    return NextResponse.json(
      { error: "Failed to update banner" },
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
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.banner.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete banner:", error)
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    )
  }
}
