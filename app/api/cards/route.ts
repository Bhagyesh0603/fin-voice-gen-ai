import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import { Card } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const cards = await Card.find({ userId: session.user.id }).sort({ createdAt: -1 })
    
    return NextResponse.json(cards)
  } catch (error) {
    console.error("Error fetching cards:", error)
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, last4, type, bank, limit, balance } = body

    if (!name || !last4 || !type || !bank) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()
    
    const card = new Card({
      userId: session.user.id,
      name,
      last4,
      type,
      bank,
      limit,
      balance,
    })

    await card.save()
    
    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error("Error creating card:", error)
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 })
    }

    await connectDB()
    
    const card = await Card.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    )

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }
    
    return NextResponse.json(card)
  } catch (error) {
    console.error("Error updating card:", error)
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 })
    }

    await connectDB()
    
    const card = await Card.findOneAndDelete({
      _id: id,
      userId: session.user.id
    })

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }
    
    return NextResponse.json({ message: "Card deleted successfully" })
  } catch (error) {
    console.error("Error deleting card:", error)
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 })
  }
}