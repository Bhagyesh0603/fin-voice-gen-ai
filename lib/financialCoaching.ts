import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"

export interface FinancialData {
  expenses: Expense[]
  budgets: Budget[]
  goals: Goal[]
  investments: Investment[]
  income: IncomeSource[]
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: Date
  paymentMethod: string
  location: string
  isRecurring?: boolean
  tags?: string[]
}

export interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  period: "monthly" | "weekly" | "yearly"
  alerts: boolean
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  category: string
  priority: "high" | "medium" | "low"
}

export interface Investment {
  id: string
  symbol: string
  name: string
  amount: number
  currentValue: number
  purchaseDate: Date
  type: "stock" | "bond" | "etf" | "crypto"
}

export interface IncomeSource {
  id: string
  source: string
  amount: number
  frequency: "monthly" | "weekly" | "yearly"
  isActive: boolean
}

export interface FinancialInsight {
  type: "warning" | "opportunity" | "achievement" | "recommendation"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  actionable: boolean
  suggestedAction?: string
  impact: number // 1-10 scale
  category: string
}

export interface SpendingPattern {
  category: string
  averageMonthly: number
  trend: "increasing" | "decreasing" | "stable"
  seasonality: boolean
  peakDays: string[]
  riskLevel: "low" | "medium" | "high"
}

export class FinancialCoachingAgent {
  private data: FinancialData
  private learningHistory: any[] = []

  constructor(data: FinancialData) {
    this.data = data
    this.loadLearningHistory()
  }

  private loadLearningHistory() {
    const stored = localStorage.getItem("finvoice_learning_history")
    this.learningHistory = stored ? JSON.parse(stored) : []
  }

  private saveLearningHistory() {
    localStorage.setItem("finvoice_learning_history", JSON.stringify(this.learningHistory))
  }

  // Analyze spending patterns with machine learning-like approach
  analyzeSpendingPatterns(): SpendingPattern[] {
    const patterns: SpendingPattern[] = []
    const categories = [...new Set(this.data.expenses.map((e) => e.category))]

    categories.forEach((category) => {
      const categoryExpenses = this.data.expenses.filter((e) => e.category === category)
      const monthlyAmounts = this.getMonthlyAmounts(categoryExpenses)
      const averageMonthly = monthlyAmounts.reduce((sum, amt) => sum + amt, 0) / monthlyAmounts.length

      // Trend analysis
      const recentMonths = monthlyAmounts.slice(-3)
      const olderMonths = monthlyAmounts.slice(-6, -3)
      const recentAvg = recentMonths.reduce((sum, amt) => sum + amt, 0) / recentMonths.length
      const olderAvg = olderMonths.reduce((sum, amt) => sum + amt, 0) / olderMonths.length

      let trend: "increasing" | "decreasing" | "stable" = "stable"
      if (recentAvg > olderAvg * 1.1) trend = "increasing"
      else if (recentAvg < olderAvg * 0.9) trend = "decreasing"

      // Risk assessment
      const variance = this.calculateVariance(monthlyAmounts)
      const riskLevel = variance > averageMonthly * 0.5 ? "high" : variance > averageMonthly * 0.2 ? "medium" : "low"

      // Peak spending days
      const daySpending = this.getDayOfWeekSpending(categoryExpenses)
      const peakDays = Object.entries(daySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([day]) => day)

      patterns.push({
        category,
        averageMonthly,
        trend,
        seasonality: this.detectSeasonality(categoryExpenses),
        peakDays,
        riskLevel,
      })
    })

    return patterns
  }

  // Generate personalized insights and recommendations
  generateInsights(): FinancialInsight[] {
    const insights: FinancialInsight[] = []
    const patterns = this.analyzeSpendingPatterns()

    // Budget overspending alerts
    this.data.budgets.forEach((budget) => {
      const spentPercentage = (budget.spent / budget.amount) * 100
      if (spentPercentage > 90) {
        insights.push({
          type: "warning",
          title: `${budget.category} Budget Alert`,
          description: `You've spent ${spentPercentage.toFixed(1)}% of your ${budget.category} budget. Consider reducing spending in this category.`,
          priority: spentPercentage > 100 ? "high" : "medium",
          actionable: true,
          suggestedAction: `Review recent ${budget.category} expenses and identify areas to cut back`,
          impact: 8,
          category: budget.category,
        })
      }
    })

    // Spending trend analysis
    patterns.forEach((pattern) => {
      if (pattern.trend === "increasing" && pattern.riskLevel === "high") {
        insights.push({
          type: "warning",
          title: `Rising ${pattern.category} Spending`,
          description: `Your ${pattern.category} spending has increased significantly. Average monthly: ₹${pattern.averageMonthly.toFixed(0)}`,
          priority: "medium",
          actionable: true,
          suggestedAction: `Set a stricter budget for ${pattern.category} and track daily expenses`,
          impact: 7,
          category: pattern.category,
        })
      }

      if (pattern.trend === "decreasing") {
        insights.push({
          type: "achievement",
          title: `Great Progress on ${pattern.category}`,
          description: `You've successfully reduced your ${pattern.category} spending. Keep up the good work!`,
          priority: "low",
          actionable: false,
          impact: 5,
          category: pattern.category,
        })
      }
    })

    // Goal progress insights
    this.data.goals.forEach((goal) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100
      const daysLeft = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      const monthlyRequired = (goal.targetAmount - goal.currentAmount) / (daysLeft / 30)

      if (progress < 50 && daysLeft < 180) {
        insights.push({
          type: "recommendation",
          title: `${goal.name} Needs Attention`,
          description: `You need to save ₹${monthlyRequired.toFixed(0)} monthly to reach your goal on time.`,
          priority: "high",
          actionable: true,
          suggestedAction: `Increase monthly savings or adjust goal timeline`,
          impact: 9,
          category: "goals",
        })
      }
    })

    // Investment opportunities
    const totalCash = this.calculateAvailableCash()
    if (totalCash > 50000) {
      insights.push({
        type: "opportunity",
        title: "Investment Opportunity",
        description: `You have ₹${totalCash.toFixed(0)} in cash. Consider investing for better returns.`,
        priority: "medium",
        actionable: true,
        suggestedAction: "Explore SIP investments or fixed deposits",
        impact: 6,
        category: "investments",
      })
    }

    // Seasonal spending predictions
    const currentMonth = new Date().getMonth()
    if (currentMonth === 10 || currentMonth === 11) {
      // Nov-Dec
      insights.push({
        type: "recommendation",
        title: "Festival Season Budget Planning",
        description: "Festival season is approaching. Plan your budget for gifts, travel, and celebrations.",
        priority: "medium",
        actionable: true,
        suggestedAction: "Create a separate festival budget and start saving now",
        impact: 7,
        category: "planning",
      })
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Proactive risk identification
  identifyRisks(): FinancialInsight[] {
    const risks: FinancialInsight[] = []

    // Emergency fund check
    const monthlyExpenses = this.calculateMonthlyExpenses()
    const emergencyFund = this.calculateEmergencyFund()
    const emergencyMonths = emergencyFund / monthlyExpenses

    if (emergencyMonths < 3) {
      risks.push({
        type: "warning",
        title: "Insufficient Emergency Fund",
        description: `Your emergency fund covers only ${emergencyMonths.toFixed(1)} months of expenses. Aim for 6 months.`,
        priority: "high",
        actionable: true,
        suggestedAction: "Increase emergency fund savings by ₹5,000 monthly",
        impact: 10,
        category: "emergency",
      })
    }

    // Debt-to-income ratio
    const monthlyIncome = this.calculateMonthlyIncome()
    const debtPayments = this.calculateMonthlyDebtPayments()
    const debtRatio = (debtPayments / monthlyIncome) * 100

    if (debtRatio > 40) {
      risks.push({
        type: "warning",
        title: "High Debt-to-Income Ratio",
        description: `Your debt payments are ${debtRatio.toFixed(1)}% of income. This is above the recommended 40%.`,
        priority: "high",
        actionable: true,
        suggestedAction: "Consider debt consolidation or increase income sources",
        impact: 9,
        category: "debt",
      })
    }

    // Irregular income patterns
    const incomeVariability = this.calculateIncomeVariability()
    if (incomeVariability > 0.3) {
      risks.push({
        type: "warning",
        title: "Irregular Income Pattern",
        description: "Your income shows high variability. Consider building a larger emergency fund.",
        priority: "medium",
        actionable: true,
        suggestedAction: "Diversify income sources and maintain 8-month emergency fund",
        impact: 7,
        category: "income",
      })
    }

    return risks
  }

  // Personalized recommendations based on user behavior
  getPersonalizedRecommendations(): FinancialInsight[] {
    const recommendations: FinancialInsight[] = []
    const patterns = this.analyzeSpendingPatterns()

    // Category-specific recommendations
    patterns.forEach((pattern) => {
      if (pattern.category === "Food & Dining" && pattern.averageMonthly > 15000) {
        recommendations.push({
          type: "recommendation",
          title: "Optimize Food Expenses",
          description: "Consider meal planning and cooking at home to reduce dining expenses.",
          priority: "medium",
          actionable: true,
          suggestedAction: "Set a weekly meal plan and grocery budget",
          impact: 6,
          category: "Food & Dining",
        })
      }

      if (pattern.category === "Transportation" && pattern.peakDays.includes("Monday")) {
        recommendations.push({
          type: "recommendation",
          title: "Transportation Optimization",
          description: "You spend more on transportation on Mondays. Consider carpooling or public transport.",
          priority: "low",
          actionable: true,
          suggestedAction: "Explore monthly transport passes or ride-sharing options",
          impact: 4,
          category: "Transportation",
        })
      }
    })

    // Investment recommendations based on age and risk profile
    const age = this.estimateUserAge()
    const riskTolerance = this.calculateRiskTolerance()

    if (age < 35 && riskTolerance === "high") {
      recommendations.push({
        type: "opportunity",
        title: "Aggressive Growth Strategy",
        description: "Your age and risk profile suggest focusing on equity investments for long-term growth.",
        priority: "medium",
        actionable: true,
        suggestedAction: "Allocate 70% to equity mutual funds, 30% to debt",
        impact: 8,
        category: "investments",
      })
    }

    return recommendations
  }

  // Continuous learning from user interactions
  learnFromUserBehavior(action: string, category: string, outcome: "positive" | "negative") {
    const learningEntry = {
      timestamp: new Date(),
      action,
      category,
      outcome,
      context: this.getCurrentFinancialContext(),
    }

    this.learningHistory.push(learningEntry)
    this.saveLearningHistory()

    // Adjust future recommendations based on learning
    this.adjustRecommendationWeights(action, category, outcome)
  }

  // Helper methods
  private getMonthlyAmounts(expenses: Expense[]): number[] {
    const monthlyTotals: { [key: string]: number } = {}

    expenses.forEach((expense) => {
      const monthKey = format(expense.date, "yyyy-MM")
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount
    })

    return Object.values(monthlyTotals)
  }

  private calculateVariance(amounts: number[]): number {
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
    const squaredDiffs = amounts.map((amt) => Math.pow(amt - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / amounts.length
  }

  private getDayOfWeekSpending(expenses: Expense[]): { [key: string]: number } {
    const dayTotals: { [key: string]: number } = {}
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    expenses.forEach((expense) => {
      const day = days[expense.date.getDay()]
      dayTotals[day] = (dayTotals[day] || 0) + expense.amount
    })

    return dayTotals
  }

  private detectSeasonality(expenses: Expense[]): boolean {
    const monthlyTotals = this.getMonthlyAmounts(expenses)
    if (monthlyTotals.length < 12) return false

    const variance = this.calculateVariance(monthlyTotals)
    const mean = monthlyTotals.reduce((sum, amt) => sum + amt, 0) / monthlyTotals.length

    return variance > mean * 0.3 // High variance indicates seasonality
  }

  private calculateAvailableCash(): number {
    // Simplified calculation - in real app, this would come from bank integration
    const totalIncome = this.data.income.reduce((sum, income) => sum + income.amount, 0)
    const totalExpenses = this.data.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return Math.max(0, totalIncome - totalExpenses)
  }

  private calculateMonthlyExpenses(): number {
    const currentMonth = new Date()
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    return this.data.expenses
      .filter((expense) => expense.date >= monthStart && expense.date <= monthEnd)
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  private calculateEmergencyFund(): number {
    // This would typically come from savings account data
    return 150000 // Placeholder
  }

  private calculateMonthlyIncome(): number {
    return this.data.income
      .filter((income) => income.isActive)
      .reduce((sum, income) => {
        switch (income.frequency) {
          case "monthly":
            return sum + income.amount
          case "weekly":
            return sum + income.amount * 4.33
          case "yearly":
            return sum + income.amount / 12
          default:
            return sum
        }
      }, 0)
  }

  private calculateMonthlyDebtPayments(): number {
    // This would come from loan/credit card data
    return 25000 // Placeholder
  }

  private calculateIncomeVariability(): number {
    // Calculate coefficient of variation for income
    const monthlyIncomes = [45000, 48000, 42000, 50000, 46000, 44000] // Placeholder
    const mean = monthlyIncomes.reduce((sum, income) => sum + income, 0) / monthlyIncomes.length
    const variance = this.calculateVariance(monthlyIncomes)
    return Math.sqrt(variance) / mean
  }

  private estimateUserAge(): number {
    // This would come from user profile
    return 28 // Placeholder
  }

  private calculateRiskTolerance(): "low" | "medium" | "high" {
    // Based on investment behavior and user preferences
    return "medium" // Placeholder
  }

  private getCurrentFinancialContext(): any {
    return {
      totalExpenses: this.data.expenses.reduce((sum, e) => sum + e.amount, 0),
      budgetUtilization: this.data.budgets.map((b) => b.spent / b.amount),
      goalProgress: this.data.goals.map((g) => g.currentAmount / g.targetAmount),
    }
  }

  private adjustRecommendationWeights(action: string, category: string, outcome: "positive" | "negative") {
    // Machine learning-like adjustment of recommendation weights
    // This would be more sophisticated in a real implementation
    console.log(`Learning: ${action} in ${category} had ${outcome} outcome`)
  }
}

// Export utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export const getFinancialHealthScore = (data: FinancialData): number => {
  // Simplified financial health scoring algorithm
  const score = 100

  // Budget adherence (30% weight)
  const budgetScore = data.budgets.reduce((avg, budget) => {
    const utilization = budget.spent / budget.amount
    if (utilization > 1) return avg - 10
    if (utilization > 0.9) return avg - 5
    return avg
  }, 30)

  // Goal progress (25% weight)
  const goalScore = data.goals.reduce((avg, goal) => {
    const progress = goal.currentAmount / goal.targetAmount
    return avg + (progress * 25) / data.goals.length
  }, 0)

  // Investment diversification (25% weight)
  const investmentTypes = [...new Set(data.investments.map((i) => i.type))]
  const diversificationScore = Math.min(25, investmentTypes.length * 6.25)

  // Expense trend (20% weight)
  const recentExpenses = data.expenses.filter((e) => e.date >= subMonths(new Date(), 1))
  const previousExpenses = data.expenses.filter(
    (e) => e.date >= subMonths(new Date(), 2) && e.date < subMonths(new Date(), 1),
  )

  const recentTotal = recentExpenses.reduce((sum, e) => sum + e.amount, 0)
  const previousTotal = previousExpenses.reduce((sum, e) => sum + e.amount, 0)

  const expenseScore =
    recentTotal <= previousTotal ? 20 : Math.max(0, 20 - ((recentTotal - previousTotal) / previousTotal) * 100)

  return Math.max(0, Math.min(100, budgetScore + goalScore + diversificationScore + expenseScore))
}
