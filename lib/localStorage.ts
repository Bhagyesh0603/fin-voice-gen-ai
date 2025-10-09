export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
}

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  voiceNote?: string
  createdAt: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  period: "monthly" | "weekly" | "yearly"
  createdAt: string
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: string
  createdAt: string
}

export interface Investment {
  id: string
  name: string
  type: string
  amount: number
  currentValue: number
  returns: number
  createdAt: string
}

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

export interface Card {
  id: string
  name: string
  type: "Credit Card" | "Debit Card"
  lastFour: string
  balance: number
  limit?: number | null
  dueDate?: string | null
  status: "active" | "locked" | "expired"
  color?: string
  rewards?: string | null
  createdAt: string
}

// Data management class with strong coordination
class FinVoiceDataManager {
  private static instance: FinVoiceDataManager
  private listeners: { [key: string]: (() => void)[] } = {}

  static getInstance(): FinVoiceDataManager {
    if (!FinVoiceDataManager.instance) {
      FinVoiceDataManager.instance = new FinVoiceDataManager()
    }
    return FinVoiceDataManager.instance
  }

  // Event system for real-time coordination
  subscribe(event: string, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  unsubscribe(event: string, callback: () => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }
  }

  private emit(event: string) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback())
    }
  }

  // Generic storage methods
  private setData<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data))
    this.emit(`${key}_updated`)
    this.emit("data_changed")
  }

  private getData<T>(key: string): T[] {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  // Expense methods
  getExpenses(): Expense[] {
    return this.getData<Expense>("finvoice_expenses")
  }

  addExpense(expense: Omit<Expense, "id" | "createdAt">): Expense {
    const expenses = this.getExpenses()
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    expenses.push(newExpense)
    this.setData("finvoice_expenses", expenses)
    this.updateBudgetSpending(expense.category, expense.amount)
    return newExpense
  }

  updateExpense(id: string, updates: Partial<Expense>): void {
    const expenses = this.getExpenses()
    const index = expenses.findIndex((e) => e.id === id)
    if (index !== -1) {
      const oldAmount = expenses[index].amount
      const oldCategory = expenses[index].category
      expenses[index] = { ...expenses[index], ...updates }
      this.setData("finvoice_expenses", expenses)

      // Update budget spending
      if (updates.amount !== undefined || updates.category !== undefined) {
        this.updateBudgetSpending(oldCategory, -oldAmount)
        this.updateBudgetSpending(expenses[index].category, expenses[index].amount)
      }
    }
  }

  deleteExpense(id: string): void {
    const expenses = this.getExpenses()
    const expense = expenses.find((e) => e.id === id)
    if (expense) {
      const filtered = expenses.filter((e) => e.id !== id)
      this.setData("finvoice_expenses", filtered)
      this.updateBudgetSpending(expense.category, -expense.amount)
    }
  }

  // Budget methods
  getBudgets(): Budget[] {
    return this.getData<Budget>("finvoice_budgets")
  }

  addBudget(budget: Omit<Budget, "id" | "createdAt" | "spent">): Budget {
    const budgets = this.getBudgets()
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      spent: this.calculateCategorySpending(budget.category),
      createdAt: new Date().toISOString(),
    }
    budgets.push(newBudget)
    this.setData("finvoice_budgets", budgets)
    return newBudget
  }

  private updateBudgetSpending(category: string, amount: number): void {
    const budgets = this.getBudgets()
    const budget = budgets.find((b) => b.category === category)
    if (budget) {
      budget.spent += amount
      this.setData("finvoice_budgets", budgets)
    }
  }

  private calculateCategorySpending(category: string): number {
    const expenses = this.getExpenses()
    return expenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0)
  }

  // Goal methods
  getGoals(): Goal[] {
    return this.getData<Goal>("finvoice_goals")
  }

  addGoal(goal: Omit<Goal, "id" | "createdAt">): Goal {
    const goals = this.getGoals()
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    goals.push(newGoal)
    this.setData("finvoice_goals", goals)
    return newGoal
  }

  updateGoal(id: string, updates: Partial<Goal>): void {
    const goals = this.getGoals()
    const index = goals.findIndex((g) => g.id === id)
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates }
      this.setData("finvoice_goals", goals)
    }
  }

  deleteGoal(id: string): void {
    const goals = this.getGoals()
    const filtered = goals.filter((g) => g.id !== id)
    this.setData("finvoice_goals", filtered)
  }

  contributeToGoal(goalId: string, amount: number, note?: string, date?: string): void {
    if (amount <= 0) return
    const goals = this.getGoals()
    const idx = goals.findIndex((g) => g.id === goalId)
    if (idx === -1) return
    goals[idx].currentAmount = (goals[idx].currentAmount || 0) + amount
    this.setData("finvoice_goals", goals)

    // mirror contribution as an expense for cross-section analytics/budgets
    this.addExpense({
      amount,
      category: `Goal Contribution - ${goals[idx].title}`,
      description: note || "Goal contribution",
      date: date || new Date().toISOString().slice(0, 10),
    })
  }

  // Investment methods
  getInvestments(): Investment[] {
    return this.getData<Investment>("finvoice_investments")
  }

  addInvestment(investment: Omit<Investment, "id" | "createdAt">): Investment {
    const investments = this.getInvestments()
    const newInvestment: Investment = {
      ...investment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    investments.push(newInvestment)
    this.setData("finvoice_investments", investments)
    return newInvestment
  }

  // Card methods
  getCards(): Card[] {
    return this.getData<Card>("finvoice_cards")
  }

  addCard(card: Omit<Card, "id" | "createdAt">): Card {
    const cards = this.getCards()
    const newCard: Card = {
      ...card,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    cards.push(newCard)
    this.setData("finvoice_cards", cards)
    return newCard
  }

  updateCard(id: string, updates: Partial<Card>): void {
    const cards = this.getCards()
    const idx = cards.findIndex((c) => c.id === id)
    if (idx === -1) return
    cards[idx] = { ...cards[idx], ...updates }
    this.setData("finvoice_cards", cards)
  }

  deleteCard(id: string): void {
    const cards = this.getCards()
    const filtered = cards.filter((c) => c.id !== id)
    this.setData("finvoice_cards", filtered)
  }

  // Analytics methods
  getMonthlyExpenses(): { month: string; amount: number }[] {
    const expenses = this.getExpenses()
    const monthlyData: { [key: string]: number } = {}

    expenses.forEach((expense) => {
      const month = new Date(expense.date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
      })
      monthlyData[month] = (monthlyData[month] || 0) + expense.amount
    })

    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }))
  }

  getCategoryExpenses(): { category: string; amount: number }[] {
    const expenses = this.getExpenses()
    const categoryData: { [key: string]: number } = {}

    expenses.forEach((expense) => {
      categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount
    })

    return Object.entries(categoryData).map(([category, amount]) => ({ category, amount }))
  }

  getTotalBalance(): { income: number; expenses: number; balance: number } {
    const expenses = this.getExpenses()
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalIncome = 150000 // Mock income for demo

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
    }
  }

  // Report generation data
  getReportData() {
    return {
      expenses: this.getExpenses(),
      budgets: this.getBudgets(),
      goals: this.getGoals(),
      investments: this.getInvestments(),
      cards: this.getCards(),
      monthlyExpenses: this.getMonthlyExpenses(),
      categoryExpenses: this.getCategoryExpenses(),
      totalBalance: this.getTotalBalance(),
    }
  }
}

export const dataManager = FinVoiceDataManager.getInstance()

// Initialize with sample data if empty
export const initializeSampleData = () => {
  if (dataManager.getExpenses().length === 0) {
    // Sample expenses
    const sampleExpenses = [
      {
        amount: 1200,
        category: "Food & Dining",
        description: "Lunch at restaurant",
        date: "2024-01-15",
        voiceNote: "Had lunch with colleagues",
      },
      { amount: 3500, category: "Transportation", description: "Uber rides", date: "2024-01-14" },
      { amount: 8500, category: "Shopping", description: "Clothing purchase", date: "2024-01-13" },
      { amount: 2800, category: "Entertainment", description: "Movie tickets", date: "2024-01-12" },
      { amount: 15000, category: "Healthcare", description: "Medical checkup", date: "2024-01-11" },
    ]

    sampleExpenses.forEach((expense) => dataManager.addExpense(expense))

    // Sample budgets
    dataManager.addBudget({ category: "Food & Dining", amount: 15000, period: "monthly" })
    dataManager.addBudget({ category: "Transportation", amount: 8000, period: "monthly" })
    dataManager.addBudget({ category: "Entertainment", amount: 5000, period: "monthly" })

    // Sample goals
    dataManager.addGoal({
      title: "Emergency Fund",
      targetAmount: 500000,
      currentAmount: 125000,
      deadline: "2024-12-31",
      category: "Savings",
    })

    dataManager.addGoal({
      title: "Vacation Fund",
      targetAmount: 100000,
      currentAmount: 35000,
      deadline: "2024-06-30",
      category: "Travel",
    })

    // Sample cards
    dataManager.addCard({
      name: "Visa Card",
      type: "Credit Card",
      lastFour: "1234",
      balance: 5000,
      limit: 10000,
      dueDate: "2024-02-15",
      status: "active",
      color: "#FF5733",
      rewards: "Cashback",
    })

    dataManager.addCard({
      name: "MasterCard",
      type: "Debit Card",
      lastFour: "5678",
      balance: 2000,
      status: "active",
      color: "#33FF57",
    })
  }
}
