"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"

const portfolioData = [
  { month: "Jan", value: 45000 },
  { month: "Feb", value: 47200 },
  { month: "Mar", value: 44800 },
  { month: "Apr", value: 48500 },
  { month: "May", value: 52100 },
  { month: "Jun", value: 54300 },
]

const allocationData = [
  { name: "Stocks", value: 60, amount: 32580, color: "#3b82f6" },
  { name: "Bonds", value: 25, amount: 13575, color: "#10b981" },
  { name: "REITs", value: 10, amount: 5430, color: "#f59e0b" },
  { name: "Cash", value: 5, amount: 2715, color: "#6b7280" },
]

const holdings = [
  {
    symbol: "VTI",
    name: "Vanguard Total Stock Market ETF",
    shares: 125,
    avgCost: 220.5,
    currentPrice: 235.8,
    value: 29475,
    change: 15.3,
    changePercent: 6.94,
    allocation: 54.3,
  },
  {
    symbol: "BND",
    name: "Vanguard Total Bond Market ETF",
    shares: 160,
    avgCost: 82.3,
    currentPrice: 84.8,
    value: 13568,
    change: 2.5,
    changePercent: 3.04,
    allocation: 25.0,
  },
  {
    symbol: "VNQ",
    name: "Vanguard Real Estate ETF",
    shares: 55,
    avgCost: 95.2,
    currentPrice: 98.7,
    value: 5428,
    change: 3.5,
    changePercent: 3.68,
    allocation: 10.0,
  },
  {
    symbol: "VMOT",
    name: "Vanguard Ultra-Short-Term Bond ETF",
    shares: 55,
    avgCost: 49.8,
    currentPrice: 49.4,
    value: 2717,
    change: -0.4,
    changePercent: -0.8,
    allocation: 5.0,
  },
]

const recommendations = [
  {
    type: "rebalance",
    title: "Portfolio Rebalancing Needed",
    description: "Your stock allocation is 4% above target. Consider rebalancing.",
    priority: "medium",
    action: "Rebalance Portfolio",
  },
  {
    type: "opportunity",
    title: "Dollar-Cost Averaging Opportunity",
    description: "Market conditions favor increasing your monthly investment by $200.",
    priority: "low",
    action: "Increase Investment",
  },
  {
    type: "tax",
    title: "Tax-Loss Harvesting Available",
    description: "You can harvest $1,200 in tax losses from your bond positions.",
    priority: "high",
    action: "Harvest Losses",
  },
]

const performanceData = [
  { period: "1D", return: 0.8, benchmark: 0.6 },
  { period: "1W", return: 2.1, benchmark: 1.8 },
  { period: "1M", return: 4.2, benchmark: 3.9 },
  { period: "3M", return: 8.7, benchmark: 7.2 },
  { period: "6M", return: 12.4, benchmark: 10.8 },
  { period: "1Y", return: 18.6, benchmark: 15.2 },
]

export default function InvestmentsPage() {
  const [showValues, setShowValues] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("1Y")

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)
  const totalGain = holdings.reduce((sum, holding) => sum + holding.change * holding.shares, 0)
  const totalGainPercent = (totalGain / (totalValue - totalGain)) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Investment Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track and manage your investment performance</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => setShowValues(!showValues)}>
            {showValues ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showValues ? "Hide Values" : "Show Values"}
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Investment
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{showValues ? `$${totalValue.toLocaleString()}` : "••••••"}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />+{totalGainPercent.toFixed(2)}% total return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{showValues ? "+$432" : "••••"}</div>
            <p className="text-xs text-muted-foreground">+0.8% today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Return</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">18.6%</div>
            <p className="text-xs text-muted-foreground">vs 15.2% benchmark</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2</div>
            <p className="text-xs text-muted-foreground">Moderate risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Portfolio Value</CardTitle>
                <CardDescription>Your investment growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={portfolioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Asset Allocation</CardTitle>
                <CardDescription>How your portfolio is distributed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {allocationData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {showValues ? `$${item.amount.toLocaleString()}` : "••••"}
                          </div>
                          <div className="text-xs text-muted-foreground">{item.value}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Current Holdings</CardTitle>
              <CardDescription>Detailed view of your investment positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings.map((holding, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-primary text-sm">{holding.symbol}</span>
                      </div>
                      <div>
                        <p className="font-medium">{holding.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {holding.shares} shares @ ${holding.currentPrice}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold">{showValues ? `$${holding.value.toLocaleString()}` : "••••••"}</div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={holding.changePercent >= 0 ? "default" : "destructive"} className="text-xs">
                          {holding.changePercent >= 0 ? "+" : ""}
                          {holding.changePercent.toFixed(2)}%
                        </Badge>
                        <span className="text-xs text-muted-foreground">{holding.allocation}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Performance vs Benchmark</CardTitle>
              <CardDescription>How your portfolio compares to market indices</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="return" fill="hsl(var(--primary))" name="Your Portfolio" />
                  <Bar dataKey="benchmark" fill="hsl(var(--muted-foreground))" name="Benchmark" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Risk Metrics</CardTitle>
                <CardDescription>Portfolio risk analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Volatility</span>
                  <span className="text-sm font-bold">12.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sharpe Ratio</span>
                  <span className="text-sm font-bold">1.34</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Max Drawdown</span>
                  <span className="text-sm font-bold text-red-600">-8.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Beta</span>
                  <span className="text-sm font-bold">0.92</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Dividend Income</CardTitle>
                <CardDescription>Annual dividend projections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Annual Dividends</span>
                  <span className="text-sm font-bold">{showValues ? "$1,240" : "••••"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Dividend Yield</span>
                  <span className="text-sm font-bold">2.28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Next Payment</span>
                  <span className="text-sm font-bold">Mar 15, 2024</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">YTD Dividends</span>
                  <span className="text-sm font-bold text-green-600">{showValues ? "$620" : "•••"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          rec.priority === "high"
                            ? "bg-red-100 text-red-600"
                            : rec.priority === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {rec.priority === "high" ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"
                        }
                      >
                        {rec.priority}
                      </Badge>
                      <Button size="sm">{rec.action}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">AI Investment Insights</CardTitle>
              <CardDescription>Personalized recommendations based on your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Strong Performance</p>
                    <p className="text-sm text-green-700">
                      Your portfolio is outperforming the benchmark by 3.4% this year. Great job on your asset
                      allocation!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Growth Opportunity</p>
                    <p className="text-sm text-blue-700">
                      Consider adding international exposure to your portfolio. A 10% allocation to emerging markets
                      could improve diversification.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
