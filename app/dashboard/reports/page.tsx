"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, TrendingDown, PieChart, BarChart3, Target, Wallet, IndianRupee } from "lucide-react"
import { useFinVoiceData } from "@/hooks/useAuthFinVoiceData"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0891b2", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [isGenerating, setIsGenerating] = useState(false)

  const { expenses: userExpenses, budgets: userBudgets, goals: userGoals, totalBalance: userTotalBalance, isLoading, error } = useFinVoiceData()

  // Generate report data from authenticated user data
  const reportData = {
    totalExpenses: userExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    totalBudgets: userBudgets.reduce((sum, budget) => sum + budget.amount, 0),
    totalGoals: userGoals.length,
    completedGoals: userGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length,
    totalBalance: userTotalBalance,
    expensesByCategory: userExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {} as Record<string, number>),
    expenses: userExpenses,
    budgets: userBudgets,
    goals: userGoals,
    investments: [], // Empty for now
    monthlyExpenses: generateMonthlyExpenses(userExpenses),
    categoryExpenses: generateCategoryExpenses(userExpenses)
  }

  function generateMonthlyExpenses(expenses: any[]) {
    // Generate monthly data from expenses
    const monthlyData = expenses.reduce((acc, exp) => {
      const month = new Date(exp.date).toLocaleString('en-US', { month: 'short' })
      acc[month] = (acc[month] || 0) + exp.amount
      return acc
    }, {})
    
    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }))
  }

  function generateCategoryExpenses(expenses: any[]) {
    const categoryData = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})
    
    return Object.entries(categoryData).map(([category, amount]) => ({ category, amount }))
  }

  const generatePDFReport = async () => {
    setIsGenerating(true)

    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create a comprehensive report content
    const reportContent = generateReportContent()

    // Create and download PDF (simulated)
    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `FinVoice-Report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setIsGenerating(false)
  }

  const generateReportContent = () => {
    if (!reportData) return ""

    const { expenses, budgets, goals, investments, totalBalance } = reportData

    const expenseBreakdown = expenses
      .map(
        (expense: any) =>
          expense.date + " | " + expense.category + " | ₹" + expense.amount.toLocaleString("en-IN") + " | " + expense.description
      )
      .join("\n")

    const budgetAnalysis = budgets
      .map((budget: any) => {
        const percentage = (budget.spent / budget.amount) * 100
        const status = percentage > 100 ? "OVER BUDGET" : percentage > 80 ? "WARNING" : "ON TRACK"
        return budget.category + ": ₹" + budget.spent.toLocaleString("en-IN") + " / ₹" + budget.amount.toLocaleString("en-IN") + " (" + percentage.toFixed(1) + "%) - " + status
      })
      .join("\n")

    const goalsProgress = goals
      .map((goal: any) => {
        const percentage = (goal.currentAmount / goal.targetAmount) * 100
        return goal.title + ": ₹" + goal.currentAmount.toLocaleString("en-IN") + " / ₹" + goal.targetAmount.toLocaleString("en-IN") + " (" + percentage.toFixed(1) + "%)"
      })
      .join("\n")

    const investmentPortfolio = investments
      .map(
        (investment: any) =>
          investment.name + ": ₹" + investment.currentValue.toLocaleString("en-IN") + " (" + (investment.returns > 0 ? "+" : "") + investment.returns.toFixed(2) + "%)"
      )
      .join("\n")

    const categoryBreakdown = Object.entries(reportData.expensesByCategory)
      .map(([category, amount]) => category + ": ₹" + Number(amount).toLocaleString("en-IN"))
      .join("\n")

    return [
      "FINVOICE FINANCIAL REPORT",
      "Generated on: " + new Date().toLocaleDateString("en-IN"),
      "========================================",
      "",
      "FINANCIAL SUMMARY",
      "-----------------",
      "Total Income: ₹" + totalBalance.income.toLocaleString("en-IN"),
      "Total Expenses: ₹" + totalBalance.expenses.toLocaleString("en-IN"),
      "Net Balance: ₹" + totalBalance.balance.toLocaleString("en-IN"),
      "Savings Rate: " + ((totalBalance.balance / totalBalance.income) * 100).toFixed(1) + "%",
      "",
      "BUDGET OVERVIEW",
      "---------------",
      "Total Budgets: " + reportData.totalBudgets,
      "Number of Goals: " + reportData.totalGoals,
      "Completed Goals: " + reportData.completedGoals,
      "",
      "CATEGORY BREAKDOWN",
      "------------------",
      categoryBreakdown,
      "",
      "EXPENSE BREAKDOWN",
      "-----------------",
      expenseBreakdown,
      "",
      "BUDGET ANALYSIS",
      "---------------",
      budgetAnalysis,
      "",
      "GOALS PROGRESS",
      "--------------",
      goalsProgress,
      "",
      "INVESTMENT PORTFOLIO",
      "--------------------",
      investmentPortfolio,
      "",
      "RECOMMENDATIONS",
      "---------------",
      "• Consider increasing savings rate to 30% of income",
      "• Review overspent budget categories",
      "• Diversify investment portfolio",
      "• Set up automatic transfers for goal achievement",
      "",
      "========================================",
      "Report generated by FinVoice AI-Powered Financial Assistant"
    ].join("\n")
  }

  if (!reportData) {
    return <div className="flex items-center justify-center h-96">Loading reports...</div>
  }

  const { expenses, budgets, goals, investments, monthlyExpenses, categoryExpenses, totalBalance } = reportData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive analysis of your financial data</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generatePDFReport} disabled={isGenerating} className="bg-primary hover:bg-primary/90">
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalBalance.balance.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">
              {totalBalance.balance > 0 ? "+" : ""}₹{Math.abs(totalBalance.balance - 120000).toLocaleString("en-IN")}{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalBalance.income.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Monthly income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalBalance.expenses.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((totalBalance.balance / totalBalance.income) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total income</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Expense Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyExpenses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]} />
                    <Line type="monotone" dataKey="amount" stroke="#0891b2" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Expense Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryExpenses}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ category, percent }) => `${category} ${(Number(percent) * 100).toFixed(0)}%`}
                    >
                      {categoryExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Your latest spending activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.slice(0, 10).map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <IndianRupee className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.category} • {new Date(expense.date).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{expense.amount.toLocaleString("en-IN")}</p>
                      {expense.voiceNote && (
                        <Badge variant="secondary" className="text-xs">
                          Voice Note
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget: any) => {
              const percentage = (budget.spent / budget.amount) * 100
              const isOverBudget = percentage > 100
              const isWarning = percentage > 80

              return (
                <Card
                  key={budget.id}
                  className={
                    isOverBudget ? "border-red-200 bg-red-50/50" : isWarning ? "border-yellow-200 bg-yellow-50/50" : ""
                  }
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                    <CardDescription>
                      ₹{budget.spent.toLocaleString("en-IN")} of ₹{budget.amount.toLocaleString("en-IN")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isOverBudget ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}% used</span>
                        <Badge variant={isOverBudget ? "destructive" : isWarning ? "secondary" : "default"}>
                          {isOverBudget ? "Over Budget" : isWarning ? "Warning" : "On Track"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal: any) => {
              const percentage = (goal.currentAmount / goal.targetAmount) * 100
              const daysLeft = Math.ceil(
                (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )

              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {goal.title}
                      <Badge variant="outline">{goal.category}</Badge>
                    </CardTitle>
                    <CardDescription>
                      ₹{goal.currentAmount.toLocaleString("en-IN")} of ₹{goal.targetAmount.toLocaleString("en-IN")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{percentage.toFixed(1)}% complete</span>
                        <span className="text-muted-foreground">
                          {daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map((investment: any) => (
              <Card key={investment.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{investment.name}</CardTitle>
                  <CardDescription>{investment.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Value</span>
                      <span className="font-semibold">₹{investment.currentValue.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Returns</span>
                      <span className={`font-semibold ${investment.returns >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {investment.returns >= 0 ? "+" : ""}
                        {investment.returns.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
