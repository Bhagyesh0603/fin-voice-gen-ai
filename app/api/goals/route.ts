import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import { Goal } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const goals = await Goal.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
    
    const formattedGoals = goals.map((goal: any) => ({
      ...goal,
      id: goal._id.toString(),
      _id: undefined
    }))

    return NextResponse.json(formattedGoals)
  } catch (error) {
    console.error('Error fetching goals:', error)
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
    const { title, targetAmount, deadline, category } = body

    if (!title || !targetAmount || !deadline || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    
    const goal = await Goal.create({
      userId: session.user.id,
      title,
      targetAmount: Number(targetAmount),
      deadline,
      category,
      currentAmount: 0
    })

    const formattedGoal = {
      ...goal.toObject(),
      id: goal._id.toString(),
      _id: undefined
    }

    return NextResponse.json(formattedGoal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}