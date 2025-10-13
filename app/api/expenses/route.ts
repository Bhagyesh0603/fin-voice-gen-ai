import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import { Expense } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const expenses = await Expense.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
    
    const formattedExpenses = expenses.map((expense: any) => ({
      ...expense,
      id: expense._id.toString(),
      _id: undefined
    }))

    return NextResponse.json(formattedExpenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
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
    const { amount, category, description, date, voiceNote } = body

    if (!amount || !category || !description || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    
    const expense = await Expense.create({
      userId: session.user.id,
      amount: Number(amount),
      category,
      description,
      date,
      voiceNote
    })

    const formattedExpense = {
      ...expense.toObject(),
      id: expense._id.toString(),
      _id: undefined
    }

    return NextResponse.json(formattedExpense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}