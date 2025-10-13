// Test MongoDB connection
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models'

export async function GET() {
  try {
    await connectDB()
    
    // Test if we can connect and query
    const userCount = await User.countDocuments()
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connected successfully',
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('MongoDB connection error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'MongoDB connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}