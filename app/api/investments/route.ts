import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/mongodb"
import { Investment } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const investments = await Investment.find({ userId: session.user.id }).sort({ createdAt: -1 })
    
    return NextResponse.json(investments)
  } catch (error) {
    console.error("Error fetching investments:", error)
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, amount, currentValue, returns } = body

    if (!name || !type || amount === undefined || currentValue === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()
    
    const investment = new Investment({
      userId: session.user.id,
      name,
      type,
      amount,
      currentValue,
      returns: returns || ((currentValue - amount) / amount) * 100,
    })

    await investment.save()
    
    return NextResponse.json(investment, { status: 201 })
  } catch (error) {
    console.error("Error creating investment:", error)
    return NextResponse.json({ error: "Failed to create investment" }, { status: 500 })
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
      return NextResponse.json({ error: "Investment ID is required" }, { status: 400 })
    }

    await connectDB()
    
    const investment = await Investment.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    )

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 })
    }
    
    return NextResponse.json(investment)
  } catch (error) {
    console.error("Error updating investment:", error)
    return NextResponse.json({ error: "Failed to update investment" }, { status: 500 })
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
      return NextResponse.json({ error: "Investment ID is required" }, { status: 400 })
    }

    await connectDB()
    
    const investment = await Investment.findOneAndDelete({
      _id: id,
      userId: session.user.id
    })

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 })
    }
    
    return NextResponse.json({ message: "Investment deleted successfully" })
  } catch (error) {
    console.error("Error deleting investment:", error)
    return NextResponse.json({ error: "Failed to delete investment" }, { status: 500 })
  }
}