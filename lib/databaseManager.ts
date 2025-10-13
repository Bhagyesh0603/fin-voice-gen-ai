import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from './mongodb'
import { Expense, Budget, Goal, Investment, Card, User } from './models'

export class DatabaseManager {
  private static instance: DatabaseManager
  
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  private async getSession() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }
    return session
  }

  // Expenses
  async getExpenses() {
    const session = await this.getSession()
    await connectDB()
    
    const expenses = await Expense.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
    
    return expenses.map((expense: any) => ({
      ...expense,
      id: expense._id.toString(),
      _id: undefined
    }))
  }

  async addExpense(expenseData: {
    amount: number
    category: string
    description: string
    date: string
    voiceNote?: string
  }) {
    const session = await this.getSession()
    await connectDB()
    
    const expense = await Expense.create({
      ...expenseData,
      userId: session.user.id
    })
    
    return {
      ...expense.toObject(),
      id: expense._id.toString(),
      _id: undefined
    }
  }

  async updateExpense(expenseId: string, updates: Partial<{
    amount: number
    category: string
    description: string
    date: string
    voiceNote?: string
  }>) {
    const session = await this.getSession()
    await connectDB()
    
    const expense = await Expense.findOneAndUpdate(
      { _id: expenseId, userId: session.user.id },
      updates,
      { new: true }
    )
    
    if (!expense) {
      throw new Error('Expense not found')
    }
    
    return {
      ...expense.toObject(),
      id: expense._id.toString(),
      _id: undefined
    }
  }

  async deleteExpense(expenseId: string) {
    const session = await this.getSession()
    await connectDB()
    
    const expense = await Expense.findOneAndDelete({
      _id: expenseId,
      userId: session.user.id
    })
    
    if (!expense) {
      throw new Error('Expense not found')
    }
    
    return true
  }

  // Budgets
  async getBudgets() {
    const session = await this.getSession()
    await connectDB()
    
    const budgets = await Budget.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
    
    return budgets.map((budget: any) => ({
      ...budget,
      id: budget._id.toString(),
      _id: undefined
    }))
  }

  async addBudget(budgetData: {
    category: string
    amount: number
    period: 'monthly' | 'weekly' | 'yearly'
  }) {
    const session = await this.getSession()
    await connectDB()
    
    const budget = await Budget.create({
      ...budgetData,
      userId: session.user.id,
      spent: 0
    })
    
    return {
      ...budget.toObject(),
      id: budget._id.toString(),
      _id: undefined
    }
  }

  // Goals
  async getGoals() {
    const session = await this.getSession()
    await connectDB()
    
    const goals = await Goal.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
    
    return goals.map((goal: any) => ({
      ...goal,
      id: goal._id.toString(),
      _id: undefined
    }))
  }

  async addGoal(goalData: {
    title: string
    targetAmount: number
    deadline: string
    category: string
  }) {
    const session = await this.getSession()
    await connectDB()
    
    const goal = await Goal.create({
      ...goalData,
      userId: session.user.id,
      currentAmount: 0
    })
    
    return {
      ...goal.toObject(),
      id: goal._id.toString(),
      _id: undefined
    }
  }

  async contributeToGoal(goalId: string, amount: number, note?: string, date?: string) {
    const session = await this.getSession()
    await connectDB()
    
    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, userId: session.user.id },
      { $inc: { currentAmount: amount } },
      { new: true }
    )
    
    if (!goal) {
      throw new Error('Goal not found')
    }
    
    // Also create an expense entry for the contribution
    await this.addExpense({
      amount,
      category: 'savings',
      description: note || `Contribution to ${goal.title}`,
      date: date || new Date().toISOString().split('T')[0]
    })
    
    return {
      ...goal.toObject(),
      id: goal._id.toString(),
      _id: undefined
    }
  }

  // Investments
  async getInvestments() {
    const session = await this.getSession()
    await connectDB()
    
    const investments = await Investment.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
    
    return investments.map((investment: any) => ({
      ...investment,
      id: investment._id.toString(),
      _id: undefined
    }))
  }

  async addInvestment(investmentData: {
    name: string
    type: string
    amount: number
    currentValue: number
    returns: number
  }) {
    const session = await this.getSession()
    await connectDB()
    
    const investment = await Investment.create({
      ...investmentData,
      userId: session.user.id
    })
    
    return {
      ...investment.toObject(),
      id: investment._id.toString(),
      _id: undefined
    }
  }

  // Cards
  async getCards() {
    const session = await this.getSession()
    await connectDB()
    
    const cards = await Card.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()
    
    return cards.map((card: any) => ({
      ...card,
      id: card._id.toString(),
      _id: undefined
    }))
  }

  async addCard(cardData: {
    name: string
    last4: string
    type: 'credit' | 'debit'
    bank: string
    limit?: number
    balance?: number
  }) {
    const session = await this.getSession()
    await connectDB()
    
    const card = await Card.create({
      ...cardData,
      userId: session.user.id
    })
    
    return {
      ...card.toObject(),
      id: card._id.toString(),
      _id: undefined
    }
  }

  // Analytics
  async getTotalBalance() {
    const session = await this.getSession()
    await connectDB()
    
    const expenses = await Expense.aggregate([
      { $match: { userId: session.user.id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    
    const goals = await Goal.aggregate([
      { $match: { userId: session.user.id } },
      { $group: { _id: null, saved: { $sum: '$currentAmount' } } }
    ])
    
    const user = await User.findById(session.user.id)
    const monthlyIncome = user?.financialProfile?.monthlyIncome || 0
    
    const totalExpenses = expenses[0]?.total || 0
    const totalSaved = goals[0]?.saved || 0
    const balance = monthlyIncome - totalExpenses + totalSaved
    
    return {
      income: monthlyIncome,
      expenses: totalExpenses,
      balance,
      saved: totalSaved
    }
  }
}

export const dbManager = DatabaseManager.getInstance()