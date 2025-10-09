"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  Mic,
  Plus,
  Search,
  Filter,
  Download,
  CalendarIcon,
  ShoppingBag,
  Car,
  Coffee,
  Home,
  Zap,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Calendar,
  Target,
  IndianRupee,
} from "lucide-react"
import { format } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { VoiceRecorder } from "@/components/voice-recorder"
import { ExpenseForm } from "@/components/expense-form"
import { VoiceNotes } from "@/components/voice-notes"
import { useFinVoiceData } from "@/hooks/useFinVoiceData"

const categories = [
  { name: "Food & Dining", icon: Coffee, color: "bg-orange-500" },
  { name: "Transportation", icon: Car, color: "bg-blue-500" },
  { name: "Shopping", icon: ShoppingBag, color: "bg-purple-500" },
  { name: "Entertainment", icon: Coffee, color: "bg-pink-500" },
  { name: "Movies & Shows", icon: Calendar, color: "bg-teal-500" },
  { name: "Birthday & Gifts", icon: Target, color: "bg-indigo-500" },
  { name: "Travel & Vacation", icon: Car, color: "bg-cyan-500" },
  { name: "Healthcare", icon: CreditCard, color: "bg-green-500" },
  { name: "Fitness & Sports", icon: Target, color: "bg-emerald-500" },
  { name: "Education & Learning", icon: Coffee, color: "bg-violet-500" },
  { name: "Bills & Utilities", icon: Zap, color: "bg-yellow-500" },
  { name: "Housing & Rent", icon: Home, color: "bg-slate-500" },
  { name: "Insurance", icon: CreditCard, color: "bg-blue-600" },
  { name: "Subscriptions", icon: Coffee, color: "bg-purple-600" },
  { name: "Pet Care", icon: Coffee, color: "bg-amber-500" },
  { name: "Charity & Donations", icon: Target, color: "bg-rose-500" },
  { name: "Business Expenses", icon: CreditCard, color: "bg-gray-600" },
  { name: "Taxes & Fees", icon: DollarSign, color: "bg-red-600" },
  { name: "Investments", icon: TrendingUp, color: "bg-green-600" },
  { name: "Other", icon: DollarSign, color: "bg-gray-500" },
]

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const { expenses, addExpense, updateExpense, deleteExpense } = useFinVoiceData()

  const handleVoiceTranscription = (text: string, amount?: number, category?: string) => {
    const newExpense = {
      description: text,
      amount: amount || 0,
      category: category || "Other",
      date: new Date().toISOString().split("T")[0],
      voiceNote: text,
    }
    addExpense(newExpense)
    setShowVoiceRecorder(false)
  }

  const handleAddExpense = (expenseData: any) => {
    addExpense(expenseData)
    setIsAddExpenseOpen(false)
  }

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense)
    setIsAddExpenseOpen(true)
  }

  const handleUpdateExpense = (expenseData: any) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData)
      setEditingExpense(null)
    }
    setIsAddExpenseOpen(false)
  }

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(expenseId)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Date", "Description", "Amount", "Category"],
      ...filteredTransactions.map((t) => [
        format(new Date(t.date), "yyyy-MM-dd"),
        t.description,
        t.amount.toString(),
        t.category,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredTransactions = expenses.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalExpenses = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const averageExpense = filteredTransactions.length > 0 ? totalExpenses / filteredTransactions.length : 0

  const categoryData = categories
    .map((category) => {
      const categoryExpenses = expenses.filter((e) => e.category === category.name)
      const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
      return {
        name: category.name,
        value: total,
        color: category.color.replace("bg-", "#").replace("-500", ""),
        count: categoryExpenses.length,
      }
    })
    .filter((c) => c.value > 0)

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthExpenses = expenses.filter((e) => {
      const expenseDate = new Date(e.date)
      return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear()
    })
    return {
      month: format(date, "MMM"),
      amount: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-bold font-serif text-foreground">Expense Tracking</h1>
          <p className="text-muted-foreground mt-1">Manage and analyze your spending</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0 animate-in slide-in-from-right-4 duration-500">
          <Button
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className={`transition-all duration-300 transform hover:scale-105 ${
              showVoiceRecorder
                ? "bg-accent hover:bg-accent/90 animate-pulse"
                : "bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
            }`}
          >
            <Mic className="w-4 h-4 mr-2" />
            Voice Add
          </Button>
          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
                <DialogDescription>
                  {editingExpense ? "Update your expense details" : "Add a new expense to your tracking system"}
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm
                onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
                initialData={editingExpense}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Voice Recorder Component */}
      {showVoiceRecorder && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <VoiceRecorder onTranscription={handleVoiceTranscription} className="max-w-md mx-auto" />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4 delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">{filteredTransactions.length} transactions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4 delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">₹{averageExpense.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4 delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ₹{monthlyData[5]?.amount.toLocaleString("en-IN") || "0"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
              Current month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4 delay-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {categoryData.length > 0 ? categoryData[0].name.split(" ")[0] : "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              ₹{categoryData.length > 0 ? categoryData[0].value.toLocaleString("en-IN") : "0"} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="animate-in slide-in-from-bottom-4 duration-500">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card className="animate-in slide-in-from-bottom-4 duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hover:bg-muted transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="hover:bg-green-50 hover:text-green-600 transition-colors bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="font-serif">Recent Transactions</CardTitle>
              <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found. Add your first expense!</p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction, index) => {
                    const categoryInfo = categories.find((cat) => cat.name === transaction.category)
                    const IconComponent = categoryInfo?.icon || DollarSign
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-all duration-300 hover:shadow-md animate-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-full ${categoryInfo?.color || "bg-gray-500"} text-white transition-transform hover:scale-110`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">
                                {transaction.category}
                              </Badge>
                              {transaction.voiceNote && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    <Mic className="w-3 h-3 mr-1" />
                                    Voice
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="font-bold text-red-600">-₹{transaction.amount.toLocaleString("en-IN")}</div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditExpense(transaction)}
                              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(transaction.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="animate-in slide-in-from-left-4 duration-500">
              <CardHeader>
                <CardTitle className="font-serif">Monthly Spending Trend</CardTitle>
                <CardDescription>Your expenses over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="animate-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <CardTitle className="font-serif">Spending by Category</CardTitle>
                <CardDescription>Distribution of your expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ₹${value.toLocaleString("en-IN")}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader>
              <CardTitle className="font-serif">Category Breakdown</CardTitle>
              <CardDescription>Detailed spending analysis by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <VoiceNotes />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon
              const categoryTotal = categoryData.find((c) => c.name === category.name)?.value || 0
              const categoryCount = categoryData.find((c) => c.name === category.name)?.count || 0
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-3 ${category.color} rounded-xl text-white transition-transform hover:scale-110`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-serif">{category.name}</CardTitle>
                        <CardDescription>
                          ₹{categoryTotal.toLocaleString("en-IN")} • {categoryCount} transactions
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget: ₹15,000</span>
                        <span>{((categoryTotal / 15000) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${category.color}`}
                          style={{ width: `${Math.min((categoryTotal / 15000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
