"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Brain, Activity, AlertTriangle, CheckCircle, TrendingUp, Lightbulb, RefreshCw } from "lucide-react"
import { useFinVoiceData } from "@/hooks/useAuthFinVoiceData"
import { FinancialCoachingAgent, getFinancialHealthScore } from "@/lib/financialCoaching"

export default function InsightsPage() {
  const [financialInsights, setFinancialInsights] = useState<any[]>([])
  const [healthScore, setHealthScore] = useState(0)
  const [coachingAgent, setCoachingAgent] = useState<FinancialCoachingAgent | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { expenses, budgets, goals, totalBalance, isLoading, error } = useFinVoiceData()

  const generateInsights = () => {
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

    setFinancialInsights([...insights, ...risks, ...recommendations])
    setHealthScore(getFinancialHealthScore(financialData))
  }

  useEffect(() => {
    generateInsights()
  }, [expenses, budgets, goals, totalBalance])

  const refreshInsights = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    generateInsights()
    setIsRefreshing(false)
  }

  const groupedInsights = {
    achievements: financialInsights.filter((i) => i.type === "achievement"),
    opportunities: financialInsights.filter((i) => i.type === "opportunity"),
    warnings: financialInsights.filter((i) => i.type === "warning"),
    recommendations: financialInsights.filter((i) => i.type === "recommendation"),
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-bold font-serif text-foreground flex items-center">
            <Brain className="w-8 h-8 mr-3 text-primary animate-pulse" />
            AI Financial Insights
          </h1>
          <p className="text-muted-foreground mt-1">Personalized recommendations based on your spending patterns</p>
        </div>
        <div className="mt-4 sm:mt-0 animate-in slide-in-from-right-4 duration-500 delay-200">
          <Button
            onClick={refreshInsights}
            disabled={isRefreshing}
            className="transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Insights"}
          </Button>
        </div>
      </div>

      {/* Financial Health Score */}
      <Card className="border-l-4 border-l-primary shadow-lg animate-in slide-in-from-left-4 duration-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary animate-pulse" />
              <CardTitle className="font-serif">Financial Health Score</CardTitle>
            </div>
            <Badge
              variant={healthScore >= 80 ? "default" : healthScore >= 60 ? "secondary" : "destructive"}
              className="animate-in zoom-in-50 duration-300 text-lg px-3 py-1"
            >
              {healthScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${
                  healthScore >= 80 ? "bg-green-500" : healthScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {healthScore >= 80
                ? "Excellent! Your financial health is strong."
                : healthScore >= 60
                  ? "Good progress! There's room for improvement."
                  : "Needs attention. Consider following the recommendations below."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        {groupedInsights.achievements.length > 0 && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                Achievements
              </CardTitle>
              <CardDescription>Your financial wins this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupedInsights.achievements.map((insight, index) => (
                  <Alert key={index} className="border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription>
                      <div className="font-medium text-sm">{insight.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{insight.description}</div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opportunities */}
        {groupedInsights.opportunities.length > 0 && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <TrendingUp className="w-5 h-5 mr-2" />
                Opportunities
              </CardTitle>
              <CardDescription>Ways to improve your finances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupedInsights.opportunities.map((insight, index) => (
                  <Alert key={index} className="border-blue-200 bg-blue-50">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <AlertDescription>
                      <div className="font-medium text-sm">{insight.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{insight.description}</div>
                      {insight.suggestedAction && (
                        <div className="text-xs font-medium text-blue-600 mt-2">💡 {insight.suggestedAction}</div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
        {groupedInsights.warnings.length > 0 && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Warnings
              </CardTitle>
              <CardDescription>Areas that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupedInsights.warnings.map((insight, index) => (
                  <Alert key={index} className="border-red-200 bg-red-50">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <AlertDescription>
                      <div className="font-medium text-sm">{insight.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{insight.description}</div>
                      {insight.suggestedAction && (
                        <div className="text-xs font-medium text-red-600 mt-2">⚠️ {insight.suggestedAction}</div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {groupedInsights.recommendations.length > 0 && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <Lightbulb className="w-5 h-5 mr-2" />
                Recommendations
              </CardTitle>
              <CardDescription>Personalized advice for you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupedInsights.recommendations.map((insight, index) => (
                  <Alert key={index} className="border-purple-200 bg-purple-50">
                    <Lightbulb className="w-4 h-4 text-purple-600" />
                    <AlertDescription>
                      <div className="font-medium text-sm">{insight.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{insight.description}</div>
                      {insight.suggestedAction && (
                        <div className="text-xs font-medium text-purple-600 mt-2">💡 {insight.suggestedAction}</div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
