"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Download,
  Activity,
  Target,
  CreditCard,
  Wallet,
  Brain,
  AlertTriangle,
  CheckCircle,
  Zap,
  Calendar,
  Users,
} from "lucide-react"
import { useFinVoiceData } from "@/hooks/useAuthFinVoiceData"
import { FinancialCoachingAgent, getFinancialHealthScore } from "@/lib/financialCoaching"

const monthlyData = [
  { month: "Jan", income: 85000, expenses: 52000, savings: 33000, investments: 15000 },
  { month: "Feb", income: 85000, expenses: 48000, savings: 37000, investments: 18000 },
  { month: "Mar", income: 90000, expenses: 55000, savings: 35000, investments: 20000 },
  { month: "Apr", income: 85000, expenses: 58000, savings: 27000, investments: 16000 },
  { month: "May", income: 88000, expenses: 51000, savings: 37000, investments: 22000 },
  { month: "Jun", income: 92000, expenses: 54000, savings: 38000, investments: 25000 },
]

const categoryData = [
  { name: "Food & Dining", value: 18500, percentage: 35, color: "#f97316" },
  { name: "Transportation", value: 13200, percentage: 25, color: "#3b82f6" },
  { name: "Shopping", value: 10600, percentage: 20, color: "#8b5cf6" },
  { name: "Bills & Utilities", value: 7900, percentage: 15, color: "#eab308" },
  { name: "Entertainment", value: 2650, percentage: 5, color: "#ec4899" },
]

const weeklySpendingData = [
  { week: "Week 1", amount: 12500 },
  { week: "Week 2", amount: 15800 },
  { week: "Week 3", amount: 11200 },
  { week: "Week 4", amount: 14300 },
]

const savingsGoalData = [
  { month: "Jan", target: 40000, actual: 33000 },
  { month: "Feb", target: 40000, actual: 37000 },
  { month: "Mar", target: 40000, actual: 35000 },
  { month: "Apr", target: 40000, actual: 27000 },
  { month: "May", target: 40000, actual: 37000 },
  { month: "Jun", target: 40000, actual: 38000 },
]

const incomeSourcesData = [
  { name: "Primary Job", value: 75000, color: "#10b981" },
  { name: "Freelancing", value: 12000, color: "#6366f1" },
  { name: "Investments", value: 3500, color: "#f59e0b" },
  { name: "Other", value: 1500, color: "#ef4444" },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [selectedMetric, setSelectedMetric] = useState("expenses")
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [spendingPatterns, setSpendingPatterns] = useState<any[]>([])
  const [healthScore, setHealthScore] = useState(0)
  const [coachingAgent, setCoachingAgent] = useState<FinancialCoachingAgent | null>(null)

  const { expenses, budgets, goals, totalBalance, isLoading, error } = useFinVoiceData()

  useEffect(() => {
    const financialData = {
      expenses: expenses.map((e) => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        category: e.category,
        date: new Date(e.date),
        paymentMethod: "Credit Card",
        location: "Unknown",
        tags: [],
      })),
      budgets: budgets.map((b) => ({
        id: b.id,
        category: b.category,
        amount: b.amount,
        spent: b.spent,
        period: "monthly" as const,
        alerts: true,
      })),
      goals: goals.map((g) => ({
        id: g.id,
        name: g.name || "Untitled Goal",
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: new Date(g.deadline),
        category: g.category,
        priority: "medium" as const,
      })),
      investments: [],
      income: [
        {
          id: "1",
          source: "Salary",
          amount: totalBalance.income,
          frequency: "monthly" as const,
          isActive: true,
        },
      ],
    }

    const agent = new FinancialCoachingAgent(financialData)
    setCoachingAgent(agent)

    const insights = agent.generateInsights()
    const risks = agent.identifyRisks()
    const recommendations = agent.getPersonalizedRecommendations()
    const patterns = agent.analyzeSpendingPatterns()

    setAiInsights([...insights, ...risks, ...recommendations])
    setSpendingPatterns(patterns)
    setHealthScore(getFinancialHealthScore(financialData))
  }, [expenses, budgets, goals, totalBalance])

  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0)
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0)
  const totalSavings = monthlyData.reduce((sum, month) => sum + month.savings, 0)
  const avgMonthlyExpense = totalExpenses / monthlyData.length
  const savingsRate = ((totalSavings / totalIncome) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Financial Analytics</h1>
          <p className="text-muted-foreground mt-1">Detailed insights into your financial patterns</p>
          <div className="flex items-center mt-2 space-x-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Financial Health Score: </span>
            <Badge variant={healthScore >= 80 ? "default" : healthScore >= 60 ? "secondary" : "destructive"}>
              {healthScore}/100
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {aiInsights.length > 0 && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle className="font-serif">AI-Powered Financial Insights</CardTitle>
            </div>
            <CardDescription>Advanced analytics and personalized recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiInsights.slice(0, 6).map((insight, index) => (
                <Alert
                  key={index}
                  className={`${
                    insight.type === "warning"
                      ? "border-red-200 bg-red-50"
                      : insight.type === "opportunity"
                        ? "border-blue-200 bg-blue-50"
                        : insight.type === "achievement"
                          ? "border-green-200 bg-green-50"
                          : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {insight.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-medium text-sm">{insight.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{insight.description}</div>
                        {insight.suggestedAction && (
                          <div className="text-xs font-medium text-primary mt-2">💡 {insight.suggestedAction}</div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
              -3.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{savingsRate}%</div>
            <p className="text-xs text-muted-foreground">Above 20% target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Expense</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">₹{Math.round(avgMonthlyExpense).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per month average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="patterns">AI Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Income vs Expenses</CardTitle>
                <CardDescription>Monthly financial flow comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, ""]} />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Expense Categories</CardTitle>
                <CardDescription>Spending breakdown by category</CardDescription>
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
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Savings Goal Progress</CardTitle>
              <CardDescription>Target vs actual savings performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={savingsGoalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, ""]} />
                  <Bar dataKey="target" fill="#94a3b8" name="Target" />
                  <Bar dataKey="actual" fill="#10b981" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Weekly Spending Pattern</CardTitle>
                <CardDescription>Your spending habits throughout the month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklySpendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]} />
                    <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Category Breakdown</CardTitle>
                <CardDescription>Detailed spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{category.value.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{category.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Income Sources</CardTitle>
                <CardDescription>Breakdown of your income streams</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomeSourcesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ₹${Number(value).toLocaleString()}`}
                    >
                      {incomeSourcesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Monthly Income Trend</CardTitle>
                <CardDescription>Income growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Income"]} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Financial Trends Analysis</CardTitle>
              <CardDescription>Key insights and patterns in your financial behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">Savings Improvement</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your savings rate has improved by 15% over the last 3 months
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold">Dining Expenses</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Food & dining expenses increased by 8% this month</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Goal Achievement</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You're on track to meet 85% of your financial goals this year
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Spending Pattern Analysis</CardTitle>
                <CardDescription>AI-detected patterns in your spending behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendingPatterns.slice(0, 5).map((pattern, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{pattern.category}</h4>
                        <Badge
                          variant={
                            pattern.trend === "increasing"
                              ? "destructive"
                              : pattern.trend === "decreasing"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {pattern.trend}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Average Monthly: ₹{pattern.averageMonthly?.toFixed(0)}</p>
                        <p>
                          Risk Level:{" "}
                          <span
                            className={`font-medium ${
                              pattern.riskLevel === "high"
                                ? "text-red-600"
                                : pattern.riskLevel === "medium"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {pattern.riskLevel}
                          </span>
                        </p>
                        {pattern.peakDays?.length > 0 && <p>Peak Days: {pattern.peakDays.join(", ")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Predictive Analytics</CardTitle>
                <CardDescription>AI predictions for your financial future</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Next Month Prediction</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Based on your patterns, you're likely to spend ₹{(avgMonthlyExpense * 1.05).toFixed(0)} next month
                      (+5% increase due to festival season)
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-green-800">Savings Opportunity</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      You could save an additional ₹8,500 monthly by optimizing your Food & Dining expenses
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Seasonal Alert</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Your spending typically increases by 25% during festival months. Plan accordingly.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <h4 className="font-medium text-purple-800">Peer Comparison</h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      Your savings rate is 12% higher than similar income profiles in your age group
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Machine Learning Insights</CardTitle>
              <CardDescription>Advanced financial behavior analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">87%</div>
                  <div className="text-sm font-medium mb-1">Budget Adherence Score</div>
                  <div className="text-xs text-muted-foreground">Above average performance</div>
                </div>

                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">23</div>
                  <div className="text-sm font-medium mb-1">Days to Next Goal</div>
                  <div className="text-xs text-muted-foreground">Emergency fund target</div>
                </div>

                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">₹2.1L</div>
                  <div className="text-sm font-medium mb-1">Projected Annual Savings</div>
                  <div className="text-xs text-muted-foreground">Based on current trends</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
