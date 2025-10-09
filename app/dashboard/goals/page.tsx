"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Target,
  Plus,
  TrendingUp,
  CalendarIcon,
  DollarSign,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Zap,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lightbulb,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { useFinVoiceData } from "@/hooks/useFinVoiceData"

const goalCategories = [
  { name: "Emergency Fund", icon: Zap, color: "bg-red-500" },
  { name: "Home Purchase", icon: Home, color: "bg-blue-500" },
  { name: "Car Purchase", icon: Car, color: "bg-green-500" },
  { name: "Vacation", icon: Plane, color: "bg-purple-500" },
  { name: "Education", icon: GraduationCap, color: "bg-yellow-500" },
  { name: "Wedding", icon: Heart, color: "bg-pink-500" },
  { name: "Retirement", icon: Target, color: "bg-indigo-500" },
  { name: "Other", icon: DollarSign, color: "bg-gray-500" },
]

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useFinVoiceData()
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false)
  const [contribGoalId, setContribGoalId] = useState<string | null>(null)
  const [contribAmount, setContribAmount] = useState<string>("")
  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
    targetAmount: "",
    targetDate: new Date(),
    category: "",
    monthlyContribution: "",
  })

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const calculateTimeToGoal = (current: number, target: number, monthlyContribution: number) => {
    if (monthlyContribution <= 0) return "Never"
    const remaining = target - current
    const months = Math.ceil(remaining / monthlyContribution)
    return months <= 0 ? "Achieved!" : `${months} months`
  }

  const getGoalStatus = (current: number, target: number, targetDate: Date) => {
    const progress = calculateProgress(current, target)
    const daysLeft = differenceInDays(targetDate, new Date())

    if (progress >= 100) return { status: "completed", color: "text-green-600", icon: CheckCircle }
    if (daysLeft < 0) return { status: "overdue", color: "text-red-600", icon: AlertTriangle }
    if (daysLeft < 30) return { status: "urgent", color: "text-yellow-600", icon: Clock }
    return { status: "on-track", color: "text-blue-600", icon: Target }
  }

  const handleCreateGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.category) return
    addGoal({
      title: newGoal.name,
      targetAmount: Number.parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.targetDate.toISOString().slice(0, 10),
      category: newGoal.category,
    })
    setNewGoal({
      name: "",
      description: "",
      targetAmount: "",
      targetDate: new Date(),
      category: "",
      monthlyContribution: "",
    })
    setIsCreateGoalOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteGoal(id)
  }

  const handleContribute = () => {
    if (!contribGoalId) return
    const amt = Number.parseFloat(contribAmount)
    if (!amt || amt <= 0) return
    contributeToGoal(contribGoalId, amt, "Manual contribution")
    setContribGoalId(null)
    setContribAmount("")
  }

  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalMonthlyContribution = 0 // optional: store per-goal planned contribution separately if needed
  const overallProgress = totalTargetAmount ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Track and achieve your financial objectives</p>
        </div>
        <Dialog open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>Set a new financial goal to work towards</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of your goal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="10000"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    placeholder="500"
                    value={newGoal.monthlyContribution}
                    onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newGoal.targetDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newGoal.targetDate ? format(newGoal.targetDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newGoal.targetDate}
                        onSelect={(date) => setNewGoal({ ...newGoal, targetDate: date || new Date() })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newGoal.category}
                    onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalCategories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateGoalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGoal}>Create Goal</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">Active financial goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalTargetAmount)}</div>
            <p className="text-xs text-muted-foreground">Combined goal amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatINR(totalCurrentAmount)}</div>
            <p className="text-xs text-muted-foreground">{overallProgress.toFixed(1)}% of total goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatINR(totalMonthlyContribution)}</div>
            <p className="text-xs text-muted-foreground">Total monthly contributions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="goals">My Goals</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const categoryInfo = goalCategories.find((cat) => cat.name === goal.category)
              const IconComponent = categoryInfo?.icon || Target
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
              const timeToGoal = calculateTimeToGoal(goal.currentAmount, goal.targetAmount, goal.monthlyContribution)
              const status = getGoalStatus(goal.currentAmount, goal.targetAmount, new Date(goal.deadline))
              const StatusIcon = status.icon

              return (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 ${categoryInfo?.color || "bg-gray-500"} rounded-xl text-white`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-serif">{goal.title}</CardTitle>
                          <CardDescription>{goal.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              /* open an edit dialog if needed */
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(goal.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{formatINR(goal.currentAmount)}</span>
                        <span className="text-muted-foreground">{formatINR(goal.targetAmount)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Target Date</p>
                        <p className="font-medium">{format(new Date(goal.deadline), "MMM dd, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Time to Goal</p>
                        <p className="font-medium">{timeToGoal}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Contribution</p>
                        <p className="font-medium">{formatINR(goal.monthlyContribution)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-medium">{formatINR(goal.targetAmount - goal.currentAmount)}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setContribGoalId(goal.id)
                        }}
                      >
                        Add Funds
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        Adjust Goal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Goal Progress Projection</CardTitle>
              <CardDescription>Projected savings growth based on current contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={goals.map((goal) => ({
                    month: format(new Date(goal.deadline), "MMM"),
                    [goal.category]: goal.currentAmount,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  {goalCategories.map((category) => (
                    <Area
                      key={category.name}
                      type="monotone"
                      dataKey={category.name}
                      stackId="1"
                      stroke={category.color.replace("bg-", "#")}
                      fill={category.color.replace("bg-", "#")}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Monthly Contributions</CardTitle>
                <CardDescription>How much you're saving each month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const categoryInfo = goalCategories.find((cat) => cat.name === goal.category)
                    const IconComponent = categoryInfo?.icon || Target
                    const percentage = (goal.monthlyContribution / totalMonthlyContribution) * 100

                    return (
                      <div key={goal.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 ${categoryInfo?.color || "bg-gray-500"} rounded-lg text-white`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{goal.title}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-bold">{formatINR(goal.monthlyContribution)}</div>
                            <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Goal Completion Timeline</CardTitle>
                <CardDescription>When you'll reach each goal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                    .map((goal) => {
                      const categoryInfo = goalCategories.find((cat) => cat.name === goal.category)
                      const IconComponent = categoryInfo?.icon || Target
                      const daysLeft = differenceInDays(new Date(goal.deadline), new Date())
                      const progress = calculateProgress(goal.currentAmount, goal.targetAmount)

                      return (
                        <div key={goal.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 ${categoryInfo?.color || "bg-gray-500"} rounded-lg text-white`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium">{goal.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(goal.deadline), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={progress >= 100 ? "default" : daysLeft < 30 ? "destructive" : "secondary"}
                              className="mb-1"
                            >
                              {progress >= 100 ? "Complete" : daysLeft < 0 ? "Overdue" : `${daysLeft} days`}
                            </Badge>
                            <p className="text-xs text-muted-foreground">{progress.toFixed(1)}% complete</p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">AI Recommendations</CardTitle>
                <CardDescription>Personalized advice to optimize your goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Great Progress!</p>
                    <p className="text-sm text-green-700">
                      You're ahead of schedule on your Emergency Fund. Consider increasing your vacation savings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Attention Needed</p>
                    <p className="text-sm text-yellow-700">
                      Your car purchase goal needs $1,000 more monthly to meet the deadline. Consider adjusting the
                      timeline.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Optimization Tip</p>
                    <p className="text-sm text-blue-700">
                      Consider opening a high-yield savings account for your emergency fund to earn 4.5% APY.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Goal Performance</CardTitle>
                <CardDescription>How well you're tracking against targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">On Track Goals</span>
                    <Badge variant="default">3 of 4</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Progress</span>
                    <span className="text-sm font-bold">{overallProgress.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Projected Completion</span>
                    <span className="text-sm font-bold">18 months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Saved This Year</span>
                    <span className="text-sm font-bold text-green-600">{formatINR(28400)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Contribution Dialog */}
      <Dialog open={!!contribGoalId} onOpenChange={(open) => !open && setContribGoalId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>Contribute to this goal. A matching expense entry will be created.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="contrib-amt">Amount (INR)</Label>
            <Input
              id="contrib-amt"
              type="number"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setContribGoalId(null)}>
                Cancel
              </Button>
              <Button onClick={handleContribute}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
