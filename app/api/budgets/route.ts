import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import { Budget } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const budgets = await Budget.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
    
    const formattedBudgets = budgets.map((budget: any) => ({
      ...budget,
      id: budget._id.toString(),
      _id: undefined
    }))

    return NextResponse.json(formattedBudgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category, amount, period } = body

    if (!category || !amount || !period) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    
    const budget = await Budget.create({
      userId: session.user.id,
      category,
      amount: Number(amount),
      period,
      spent: 0
    })

    const formattedBudget = {
      ...budget.toObject(),
      id: budget._id.toString(),
      _id: undefined
    }

    return NextResponse.json(formattedBudget, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}