"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  MoreVertical,
  Trash2,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Target,
  PieChart,
  DollarSign,
  CreditCard,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  Bot,
  User,
} from "lucide-react"
import { format } from "date-fns"
import { dataManager } from "@/lib/localStorage"

interface Message {
  id: string
  type: "user" | "ai" | "system"
  content: string
  timestamp: Date
  isTyping?: boolean
  suggestions?: string[]
  attachments?: { name: string; type: string; url: string }[]
  metadata?: {
    confidence?: number
    category?: string
    actionable?: boolean
  }
}

const quickActions = [
  {
    title: "Analyze my spending",
    description: "Get insights on your recent expenses",
    icon: PieChart,
    prompt: "Can you analyze my spending patterns from the last month and give me insights?",
  },
  {
    title: "Budget recommendations",
    description: "Get personalized budget advice",
    icon: Target,
    prompt: "Based on my income and expenses, what budget would you recommend?",
  },
  {
    title: "Investment advice",
    description: "Learn about investment opportunities",
    icon: TrendingUp,
    prompt: "What investment options would you recommend for someone with my financial profile?",
  },
  {
    title: "Debt management",
    description: "Strategies to manage debt",
    icon: CreditCard,
    prompt: "I have some debt. What's the best strategy to pay it off efficiently?",
  },
  {
    title: "Emergency fund",
    description: "Build your emergency savings",
    icon: DollarSign,
    prompt: "How much should I have in my emergency fund and how can I build it?",
  },
  {
    title: "Tax optimization",
    description: "Maximize your tax savings",
    icon: Lightbulb,
    prompt: "What are some tax optimization strategies I should consider?",
  },
]

const initialMessages: Message[] = [
  {
    id: "1",
    type: "system",
    content: "AI Financial Advisor is now active. All conversations are encrypted and secure.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    type: "ai",
    content:
      "Hello! I'm your AI Financial Advisor. I'm here to help you make smarter financial decisions, analyze your spending, plan for goals, and answer any money-related questions you have. How can I assist you today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    suggestions: ["Analyze my spending", "Help with budgeting", "Investment advice", "Debt management"],
  },
]

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceInput, setVoiceInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setVoiceInput(transcript)
        setInputMessage(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

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

  const generateAIResponse = (userMessage: string): Message => {
    // Enrich responses with local data
    const totals = dataManager.getTotalBalance()
    const cat = dataManager.getCategoryExpenses().sort((a, b) => b.amount - a.amount)
    const topCat = cat[0]?.category
    const topAmt = cat[0]?.amount ?? 0

    const lowerMessage = userMessage.toLowerCase()
    let response = ""
    let suggestions: string[] = []
    let metadata: { confidence?: number; category?: string; actionable?: boolean } = {}

    // ... existing branching, but use INR formatting dynamically:
    if (lowerMessage.includes("spending") || lowerMessage.includes("expense")) {
      const monthly = dataManager.getMonthlyExpenses()
      const last = monthly[monthly.length - 1]?.amount ?? 0
      response = `Last month you spent ${formatINR(last)}. Your top category is ${topCat || "N/A"} at ${formatINR(
        topAmt,
      )}. Consider setting a category cap and weekly check-ins.`
      suggestions = ["Set category cap", "See breakdown", "Weekly reminders", "Export spending report"]
      metadata = { confidence: 0.93, category: "spending", actionable: true }
    } else if (lowerMessage.includes("budget")) {
      response =
        "For your income level of ₹3,45,000/month, I recommend the 50/30/20 rule: 50% (₹1,72,500) for needs, 30% (₹1,03,500) for wants, and 20% (₹69,000) for savings. Currently, you're saving 68% which is excellent! You could allocate more to your emergency fund or consider investing the excess."
      suggestions = ["Create budget plan", "Adjust categories", "Set up automatic savings", "Investment options"]
      metadata = { confidence: 0.92, category: "budgeting", actionable: true }
    } else if (lowerMessage.includes("invest")) {
      response =
        "Given your strong savings rate and financial stability, I'd recommend a diversified portfolio: 60% equity mutual funds, 30% debt funds, and 10% international funds. Start with SIP investments and consider investing ₹35,000-55,000 monthly through systematic investment plans."
      suggestions = ["View investment options", "Risk assessment", "Set investment goals", "Learn about SIPs"]
      metadata = { confidence: 0.88, category: "investment", actionable: true }
    } else if (lowerMessage.includes("debt")) {
      response =
        "I see you have minimal debt, which is great! For any existing debt, use the avalanche method: pay minimums on all debts, then put extra money toward the highest interest rate debt first. This saves the most money long-term."
      suggestions = ["Debt payoff calculator", "Avalanche vs snowball", "Refinancing options", "Credit score tips"]
      metadata = { confidence: 0.91, category: "debt", actionable: true }
    } else if (lowerMessage.includes("emergency")) {
      response =
        "Your emergency fund should cover 3-6 months of expenses. Based on your ₹2,20,000 monthly expenses, aim for ₹6,60,000-₹13,20,000. You currently have ₹10,20,000, which is perfect! Keep it in a high-yield savings account or liquid funds earning 6-8% returns."
      suggestions = [
        "High-yield savings options",
        "Emergency fund calculator",
        "Review fund amount",
        "Automate savings",
      ]
      metadata = { confidence: 0.94, category: "emergency", actionable: true }
    } else {
      response =
        "I can analyze spending, build a budget, and recommend investments using your local data. What would you like to do?"
      suggestions = ["Analyze spending", "Budget planning", "Investment advice", "Debt management"]
      metadata = { confidence: 0.85, category: "general", actionable: false }
    }

    return {
      id: Date.now().toString(),
      type: "ai",
      content: response,
      timestamp: new Date(),
      suggestions,
      metadata,
    }
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(
      () => {
        const aiResponse = generateAIResponse(inputMessage)
        setMessages((prev) => [...prev, aiResponse])
        setIsTyping(false)
      },
      1500 + Math.random() * 1000,
    )
  }

  const handleQuickAction = (prompt: string) => {
    setInputMessage(prompt)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const clearChat = () => {
    setMessages(initialMessages)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground flex items-center">
            <Bot className="w-8 h-8 mr-3 text-primary" />
            AI Financial Advisor
          </h1>
          <p className="text-muted-foreground mt-1">Get personalized financial advice and insights</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Badge variant="secondary">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            AI Active
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearChat}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Quick Actions</CardTitle>
              <CardDescription>Common financial questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => handleQuickAction(action.prompt)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Savings rate: Excellent</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>Dining expenses: Above average</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>Investment opportunity detected</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    {message.type === "system" && (
                      <div className="flex justify-center">
                        <div className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{message.content}</span>
                          <span>•</span>
                          <span>{format(message.timestamp, "HH:mm")}</span>
                        </div>
                      </div>
                    )}

                    {message.type === "user" && (
                      <div className="flex justify-end">
                        <div className="flex items-start space-x-3 max-w-[80%]">
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3">
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    )}

                    {message.type === "ai" && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-[80%]">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-2">
                            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                              <p className="text-sm">{message.content}</p>
                              {message.metadata && (
                                <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-border">
                                  <Badge variant="secondary" className="text-xs">
                                    {(message.metadata.confidence * 100).toFixed(0)}% confident
                                  </Badge>
                                  {message.metadata.actionable && (
                                    <Badge variant="outline" className="text-xs">
                                      Actionable
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {message.suggestions.map((suggestion, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 bg-transparent"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {format(message.timestamp, "HH:mm")}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyMessage(message.content)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <Separator />

            {/* Voice Input Feedback */}
            {voiceInput && (
              <div className="p-4 bg-accent/10 border-t">
                <p className="text-sm text-muted-foreground">Voice input detected:</p>
                <p className="font-medium">{voiceInput}</p>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4">
              <div className="flex items-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  className={`transition-all duration-300`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    placeholder="Ask me anything about your finances..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="min-h-[40px] resize-none"
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                AI responses are generated based on your financial data. Always consult a professional for major
                decisions.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
