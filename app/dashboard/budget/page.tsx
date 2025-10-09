"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calculator,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Coffee,
  Car,
  ShoppingBag,
  Home,
  Zap,
  CreditCard,
  DollarSign,
  Target,
  Calendar,
  IndianRupee,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { useFinVoiceData } from "@/hooks/useFinVoiceData"

const budgetCategoryOptions = [
  { name: "Food & Dining", icon: Coffee, color: "bg-orange-500" },
  { name: "Transportation", icon: Car, color: "bg-blue-500" },
  { name: "Shopping", icon: ShoppingBag, color: "bg-purple-500" },
  { name: "Bills & Utilities", icon: Zap, color: "bg-yellow-500" },
  { name: "Housing", icon: Home, color: "bg-green-500" },
  { name: "Healthcare", icon: CreditCard, color: "bg-red-500" },
  { name: "Entertainment", icon: Coffee, color: "bg-pink-500" },
  { name: "Birthday & Gifts", icon: Target, color: "bg-indigo-500" },
  { name: "Movies & Shows", icon: Calendar, color: "bg-teal-500" },
  { name: "Travel", icon: Car, color: "bg-cyan-500" },
]

export default function BudgetPage() {
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)
  const [newBudget, setNewBudget] = useState({ category: "", amount: "" })

  const { budgets, expenses, addBudget, updateBudget, deleteBudget } = useFinVoiceData()

  const budgetData = budgets.map((budget) => {
    const categoryExpenses = expenses.filter((e) => e.category === budget.category)
    const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
    const remaining = budget.amount - spent
    const categoryInfo = budgetCategoryOptions.find((c) => c.name === budget.category)

    return {
      ...budget,
      spent,
      remaining,
      transactions: categoryExpenses.length,
      icon: categoryInfo?.icon || DollarSign,
      color: categoryInfo?.color || "bg-gray-500",
    }
  })

  const handleAddBudget = () => {
    if (newBudget.category && newBudget.amount) {
      addBudget({
        category: newBudget.category,
        amount: Number.parseFloat(newBudget.amount),
        period: "monthly",
      })
      setNewBudget({ category: "", amount: "" })
      setIsAddBudgetOpen(false)
    }
  }

  const handleEditBudget = (budget: any) => {
    setEditingBudget(budget)
    setNewBudget({ category: budget.category, amount: budget.amount.toString() })
    setIsAddBudgetOpen(true)
  }

  const handleUpdateBudget = () => {
    if (editingBudget && newBudget.category && newBudget.amount) {
      updateBudget(editingBudget.id, {
        category: newBudget.category,
        amount: Number.parseFloat(newBudget.amount),
        period: "monthly",
      })
      setEditingBudget(null)
      setNewBudget({ category: "", amount: "" })
      setIsAddBudgetOpen(false)
    }
  }

  const handleDeleteBudget = (budgetId: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteBudget(budgetId)
    }
  }

  const totalBudget = budgetData.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgetData.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = totalBudget - totalSpent

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return { status: "over", color: "text-red-600", icon: AlertTriangle }
    if (percentage >= 80) return { status: "warning", color: "text-yellow-600", icon: AlertTriangle }
    return { status: "good", color: "text-green-600", icon: CheckCircle }
  }

  const pieData = budgetData
    .filter((b) => b.spent > 0)
    .map((budget) => ({
      name: budget.category,
      value: budget.spent,
      color: budget.color.replace("bg-", "#").replace("-500", ""),
    }))

  const monthlyBudgetData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthExpenses = expenses.filter((e) => {
      const expenseDate = new Date(e.date)
      return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear()
    })
    const monthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      budget: totalBudget,
      spent: monthSpent,
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-bold font-serif text-foreground">Budget Planning</h1>
          <p className="text-muted-foreground mt-1">Track and manage your spending limits</p>
        </div>
        <Dialog
          open={isAddBudgetOpen}
          onOpenChange={(open) => {
            setIsAddBudgetOpen(open)
            if (!open) {
              setEditingBudget(null)
              setNewBudget({ category: "", amount: "" })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-right-4 duration-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? "Edit Budget" : "Create New Budget"}</DialogTitle>
              <DialogDescription>
                {editingBudget ? "Update your budget limit" : "Set a spending limit for a category"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="budget-category">Category</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetCategoryOptions.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget-amount">Monthly Budget (₹)</Label>
                <Input
                  id="budget-amount"
                  type="number"
                  placeholder="0"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                />
              </div>
              <Button
                className="w-full"
                onClick={editingBudget ? handleUpdateBudget : handleAddBudget}
                disabled={!newBudget.category || !newBudget.amount}
              >
                {editingBudget ? "Update Budget" : "Create Budget"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4 delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalBudget.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Monthly allocation</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4 delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">₹{totalSpent.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of budget
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4 delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{Math.abs(totalRemaining).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">{totalRemaining >= 0 ? "Under budget" : "Over budget"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="animate-in slide-in-from-bottom-4 duration-500">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          {budgetData.length === 0 ? (
            <Card className="animate-in slide-in-from-bottom-4 duration-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No budgets created yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start by creating your first budget to track your spending limits
                </p>
                <Button onClick={() => setIsAddBudgetOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Budget
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgetData.map((budget, index) => {
                const IconComponent = budget.icon
                const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
                const status = getBudgetStatus(budget.spent, budget.amount)
                const StatusIcon = status.icon

                return (
                  <Card
                    key={budget.id}
                    className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-3 ${budget.color} rounded-xl text-white transition-transform hover:scale-110`}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-serif">{budget.category}</CardTitle>
                            <CardDescription>{budget.transactions} transactions</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-5 h-5 ${status.color}`} />
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBudget(budget)}
                              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBudget(budget.id)}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold">₹{budget.spent.toLocaleString("en-IN")}</span>
                          <span className="text-sm text-muted-foreground">
                            of ₹{budget.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <Progress value={Math.min(percentage, 100)} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className={budget.remaining >= 0 ? "text-green-600" : "text-red-600"}>
                            {budget.remaining >= 0
                              ? `₹${budget.remaining.toLocaleString("en-IN")} left`
                              : `₹${Math.abs(budget.remaining).toLocaleString("en-IN")} over`}
                          </span>
                          <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="animate-in slide-in-from-left-4 duration-500">
              <CardHeader>
                <CardTitle className="font-serif">Budget vs Spending</CardTitle>
                <CardDescription>Monthly comparison over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyBudgetData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]} />
                    <Bar dataKey="budget" fill="hsl(var(--primary))" name="Budget" />
                    <Bar dataKey="spent" fill="hsl(var(--accent))" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="animate-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <CardTitle className="font-serif">Spending Distribution</CardTitle>
                <CardDescription>Where your money goes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ₹${value.toLocaleString("en-IN")}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="font-serif">Budget History</CardTitle>
              <CardDescription>Track your budget performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyBudgetData.map((month, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors animate-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div>
                      <p className="font-medium">{month.month} 2024</p>
                      <p className="text-sm text-muted-foreground">
                        Budget: ₹{month.budget.toLocaleString("en-IN")} • Spent: ₹{month.spent.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={month.spent > month.budget ? "destructive" : "secondary"}>
                        {month.spent > month.budget ? "Over" : "Under"} Budget
                      </Badge>
                      {month.spent > month.budget ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
