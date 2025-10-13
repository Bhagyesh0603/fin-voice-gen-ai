import mongoose, { Schema, Document, Types } from 'mongoose'

// User Interface
export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password?: string
  avatar?: string
  provider?: string
  providerId?: string
  preferences: {
    currency: string
    language: string
    notifications: boolean
    voiceEnabled: boolean
  }
  financialProfile: {
    monthlyIncome?: number
    riskTolerance: 'low' | 'medium' | 'high'
    financialGoals: string[]
  }
  createdAt: Date
  updatedAt: Date
  lastActive: Date
}

// Expense Interface
export interface IExpense extends Document {
  _id: Types.ObjectId
  userId: string
  amount: number
  category: string
  description: string
  date: string
  voiceNote?: string
  createdAt: Date
}

// Budget Interface
export interface IBudget extends Document {
  _id: Types.ObjectId
  userId: string
  category: string
  amount: number
  spent: number
  period: 'monthly' | 'weekly' | 'yearly'
  createdAt: Date
}

// Goal Interface
export interface IGoal extends Document {
  _id: Types.ObjectId
  userId: string
  title: string
  name?: string // Optional, defaults to title
  description?: string
  targetAmount: number
  currentAmount: number
  monthlyContribution?: number
  deadline: string
  category: string
  createdAt: Date
}

// Investment Interface
export interface IInvestment extends Document {
  _id: Types.ObjectId
  userId: string
  name: string
  type: string
  amount: number
  currentValue: number
  returns: number
  createdAt: Date
}

// Card Interface
export interface ICard extends Document {
  _id: Types.ObjectId
  userId: string
  name: string
  last4: string
  type: 'credit' | 'debit'
  bank: string
  limit?: number
  balance?: number
  createdAt: Date
}

// Chat History Interface
export interface IChatHistory extends Document {
  _id: Types.ObjectId
  userId: string
  sessionId: string
  messages: {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }[]
  topic: string
  createdAt: Date
}

// User Schema
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String },
  provider: { type: String },
  providerId: { type: String },
  preferences: {
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true },
    voiceEnabled: { type: Boolean, default: true }
  },
  financialProfile: {
    monthlyIncome: { type: Number },
    riskTolerance: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    financialGoals: [{ type: String }]
  },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Expense Schema
const ExpenseSchema = new Schema<IExpense>({
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  voiceNote: { type: String }
}, {
  timestamps: true
})

// Budget Schema
const BudgetSchema = new Schema<IBudget>({
  userId: { type: String, required: true, index: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  period: { type: String, enum: ['monthly', 'weekly', 'yearly'], required: true }
}, {
  timestamps: true
})

// Goal Schema
const GoalSchema = new Schema<IGoal>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  name: { type: String }, // For display purposes (will default to title)
  description: { type: String },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  monthlyContribution: { type: Number },
  deadline: { type: String, required: true },
  category: { type: String, required: true }
}, {
  timestamps: true
})

// Investment Schema
const InvestmentSchema = new Schema<IInvestment>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  returns: { type: Number, required: true }
}, {
  timestamps: true
})

// Card Schema
const CardSchema = new Schema<ICard>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  last4: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  bank: { type: String, required: true },
  limit: { type: Number },
  balance: { type: Number }
}, {
  timestamps: true
})

// Chat History Schema
const ChatHistorySchema = new Schema<IChatHistory>({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  topic: { type: String, required: true }
}, {
  timestamps: true
})

// Export models
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export const Expense = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema)
export const Budget = mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema)
export const Goal = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema)
export const Investment = mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema)
export const Card = mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema)
export const ChatHistory = mongoose.models.ChatHistory || mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema)