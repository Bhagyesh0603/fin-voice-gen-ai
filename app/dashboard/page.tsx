"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Mic,
  MicOff,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CreditCard,
  ShoppingBag,
  Car,
  Coffee,
  Zap,
  Plus,
  ArrowUpRight,
  IndianRupee,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import Link from "next/link"
import { useFinVoiceData } from "@/hooks/useAuthFinVoiceData"
import { useSession } from "next-auth/react"
// import { initializeSampleData } from "@/lib/localStorage"
// import { FinancialCoachingAgent, getFinancialHealthScore } from "@/lib/financialCoaching"

const quickActions = [
  { title: "Add Expense", icon: Plus, href: "/dashboard/expenses", color: "bg-primary" },
  { title: "Set Goal", icon: Target, href: "/dashboard/goals", color: "bg-accent" },
  { title: "View Analytics", icon: TrendingUp, href: "/dashboard/analytics", color: "bg-green-500" },
  { title: "AI Advisor", icon: Zap, href: "/dashboard/advisor", color: "bg-purple-500" },
]

export default function DashboardOverview() {
  const [isListening, setIsListening] = useState(false)
  const [voiceInput, setVoiceInput] = useState("")
  const recognitionRef = useRef<any>(null)

  const { data: session } = useSession()
  const { expenses, budgets, goals, totalBalance, addExpense, isLoading, error } = useFinVoiceData()

  const getUserFirstName = () => {
    const name = session?.user?.name
    if (name) {
      return name.split(' ')[0]
    }
    return 'User'
  }

  useEffect(() => {
    // Remove sample data initialization - now using real database data

    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setVoiceInput(transcript)
        processVoiceCommand(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [expenses, budgets, goals, totalBalance])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()
    if (lowerCommand.includes("add") || lowerCommand.includes("spent")) {
      const amountMatch = command.match(/(\d+)/)
      const amount = amountMatch ? Number.parseInt(amountMatch[1]) : 0

      let category = "Others"
      if (lowerCommand.includes("food") || lowerCommand.includes("lunch") || lowerCommand.includes("dinner")) {
        category = "Food & Dining"
      } else if (lowerCommand.includes("transport") || lowerCommand.includes("uber") || lowerCommand.includes("taxi")) {
        category = "Transportation"
      } else if (lowerCommand.includes("shopping") || lowerCommand.includes("clothes")) {
        category = "Shopping"
      }

      if (amount > 0) {
        addExpense({
          amount,
          category,
          description: `Voice expense: ${command}`,
          date: new Date().toISOString().split("T")[0],
          voiceNote: command,
        })
      }
    }
  }

  const recentTransactions = expenses
    .slice(-5)
    .reverse()
    .map((expense) => ({
      id: expense.id,
      description: expense.description,
      amount: -expense.amount,
      category: expense.category,
      icon: expense.category.includes("Food")
        ? Coffee
        : expense.category.includes("Transport")
          ? Car
          : expense.category.includes("Shopping")
            ? ShoppingBag
            : DollarSign,
      time: new Date(expense.date).toLocaleDateString("en-IN"),
    }))

  const categoryData = expenses
    .reduce((acc: any[], expense) => {
      const existing = acc.find((item) => item.name === expense.category)
      if (existing) {
        existing.amount += expense.amount
      } else {
        acc.push({
          name: expense.category,
          amount: expense.amount,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        })
      }
      return acc
    }, [])
    .map((item) => ({
      ...item,
      value: Math.round((item.amount / totalBalance.expenses) * 100),
    }))

  const expenseData = [
    { month: "Jan", amount: totalBalance.expenses * 0.8, income: totalBalance.income },
    { month: "Feb", amount: totalBalance.expenses * 0.6, income: totalBalance.income },
    { month: "Mar", amount: totalBalance.expenses * 0.9, income: totalBalance.income },
    { month: "Apr", amount: totalBalance.expenses * 1.1, income: totalBalance.income },
    { month: "May", amount: totalBalance.expenses * 0.85, income: totalBalance.income },
    { month: "Jun", amount: totalBalance.expenses, income: totalBalance.income },
  ]

  const savingsRate = totalBalance.income > 0 ? Math.round((totalBalance.balance / totalBalance.income) * 100) : 0

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in-0 duration-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your financial data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-in fade-in-0 duration-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-medium">Error loading data</p>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-xl border">
        <div className="animate-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-bold font-serif text-foreground">
            Good morning, {getUserFirstName()}!
          </h1>
          <p className="text-muted-foreground mt-1">Here's your financial overview for today</p>
        </div>
        <div className="mt-4 sm:mt-0 animate-in slide-in-from-right-4 duration-500 delay-200">
          <Button
            size="lg"
            onClick={isListening ? stopListening : startListening}
            className={`transition-all duration-300 transform hover:scale-105 ${
              isListening
                ? "bg-accent hover:bg-accent/90 animate-pulse shadow-lg"
                : "bg-primary hover:bg-primary/90 shadow-md"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
            {isListening ? "Stop Listening" : "Add Expense"}
          </Button>
        </div>
      </div>

      {/* Voice Input Feedback */}
      {voiceInput && (
        <Card className="animate-in slide-in-from-bottom-4 duration-300 border-primary/20 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">You said:</p>
            <p className="font-medium text-primary">{voiceInput}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in slide-in-from-bottom-4 delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary animate-in zoom-in-50 duration-500">
              ₹{totalBalance.balance.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500 animate-bounce" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in slide-in-from-bottom-4 delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent animate-in zoom-in-50 duration-500">
              ₹{totalBalance.expenses.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="w-3 h-3 mr-1 text-green-500 animate-bounce" />
              -5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in slide-in-from-bottom-4 delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 animate-in zoom-in-50 duration-500">{savingsRate}%</div>
            <p className="text-xs text-muted-foreground">
              {savingsRate >= 60 ? "Above your 60% goal" : "Below your 60% goal"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in slide-in-from-bottom-4 delay-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 animate-in zoom-in-50 duration-500">
              ₹{totalBalance.income.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500 animate-bounce" />
              +2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
        <CardHeader>
          <CardTitle className="font-serif">Quick Actions</CardTitle>
          <CardDescription>Frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Link key={index} href={action.href}>
                  <div className="flex flex-col items-center p-6 rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:shadow-lg border border-transparent hover:border-primary/20">
                    <div
                      className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                      {action.title}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-in slide-in-from-left-4 duration-500 delay-400 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="font-serif">Income vs Expenses</CardTitle>
            <CardDescription>Your financial flow over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stackId="2"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-in slide-in-from-right-4 duration-500 delay-400 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="font-serif">Spending Categories</CardTitle>
            <CardDescription>Where your money goes this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.slice(0, 5).map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors animate-in slide-in-from-right-4 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: category.color }} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Progress value={category.value} className="w-24 h-2" />
                    <span className="text-sm font-medium min-w-[80px] text-right">
                      ₹{category.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-500">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-serif">Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </div>
          <Link href="/dashboard/expenses">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
            >
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTransactions.map((transaction, index) => {
              const IconComponent = transaction.icon
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-primary/20 hover:shadow-md animate-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-full transition-transform group-hover:scale-110 ${
                        transaction.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">{transaction.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount).toLocaleString("en-IN")}
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {transaction.category}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
