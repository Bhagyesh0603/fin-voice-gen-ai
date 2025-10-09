"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreditCard, Plus, Eye, EyeOff, Lock, Unlock, Trash2, Edit, DollarSign, CheckCircle } from "lucide-react"
import { useFinVoiceData } from "@/hooks/useFinVoiceData"

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

export default function CardsPage() {
  const { cards, addCard, updateCard, deleteCard } = useFinVoiceData()
  const [showBalance, setShowBalance] = useState<{ [key: string]: boolean }>({})
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [isEditCardOpen, setIsEditCardOpen] = useState<string | null>(null)
  const [newCard, setNewCard] = useState({
    name: "",
    type: "Credit Card" as "Credit Card" | "Debit Card",
    number: "",
    limit: "",
    expiry: "",
    cvv: "",
  })
  const [editValues, setEditValues] = useState<{ balance?: string; limit?: string }>({})

  const toggleBalanceVisibility = (cardId: string) => {
    setShowBalance((prev) => ({ ...prev, [cardId]: !prev[cardId] }))
  }

  const toggleCardStatus = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId)
    if (!card) return
    updateCard(cardId, { status: card.status === "active" ? "locked" : "active" })
  }

  const handleDeleteCard = (cardId: string) => deleteCard(cardId)

  const handleAddCard = () => {
    if (!newCard.name || !newCard.number) return
    const lastFour = newCard.number.replace(/\s+/g, "").slice(-4)
    addCard({
      name: newCard.name,
      type: newCard.type,
      lastFour,
      balance: 0,
      limit: newCard.type === "Credit Card" ? Number(newCard.limit || 0) : null,
      dueDate: null,
      status: "active",
      color:
        newCard.type === "Credit Card"
          ? "bg-gradient-to-r from-blue-600 to-purple-600"
          : "bg-gradient-to-r from-green-600 to-teal-600",
      rewards: null,
    })
    setNewCard({ name: "", type: "Credit Card", number: "", limit: "", expiry: "", cvv: "" })
    setIsAddCardOpen(false)
  }

  const handleEditSave = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId)
    if (!card) return
    updateCard(cardId, {
      balance: editValues.balance !== undefined ? Number(editValues.balance) : card.balance,
      limit: editValues.limit !== undefined ? Number(editValues.limit) : card.limit,
    })
    setEditValues({})
    setIsEditCardOpen(null)
  }

  const getUtilizationPercentage = (balance: number, limit: number | null | undefined) => {
    if (!limit) return 0
    return (balance / limit) * 100
  }

  const totalCreditLimit = cards
    .filter((c) => c.type === "Credit Card" && c.limit)
    .reduce((sum, c) => sum + (c.limit || 0), 0)
  const totalCreditUsed = cards.filter((c) => c.type === "Credit Card").reduce((sum, c) => sum + c.balance, 0)
  const totalAvailable = cards.filter((c) => c.type === "Debit Card").reduce((sum, c) => sum + c.balance, 0)
  const totalUtilPct = totalCreditLimit > 0 ? ((totalCreditUsed / totalCreditLimit) * 100).toFixed(1) : "0.0"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Payment Cards</h1>
          <p className="text-muted-foreground mt-1">Manage your credit and debit cards</p>
        </div>
        <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
              <DialogDescription>Add a credit or debit card to your account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="card-name">Card Name</Label>
                <Input
                  id="card-name"
                  placeholder="e.g., Chase Sapphire"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card-expiry">Expiry Date</Label>
                  <Input
                    id="card-expiry"
                    placeholder="MM/YY"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="card-cvv">CVV</Label>
                  <Input
                    id="card-cvv"
                    placeholder="123"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="card-limit">Credit Limit (INR)</Label>
                <Input
                  id="card-limit"
                  placeholder="e.g., 5000"
                  value={newCard.limit}
                  onChange={(e) => setNewCard({ ...newCard, limit: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleAddCard}>
                Add Card
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit Limit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatINR(totalCreditLimit)}</div>
            <p className="text-xs text-muted-foreground">Across all credit cards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Used</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatINR(totalCreditUsed)}</div>
            <p className="text-xs text-muted-foreground">{totalUtilPct}% utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatINR(totalAvailable)}</div>
            <p className="text-xs text-muted-foreground">In checking & savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards Grid */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Cards</TabsTrigger>
          <TabsTrigger value="credit">Credit Cards</TabsTrigger>
          <TabsTrigger value="debit">Debit Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Card Visual */}
                <div className={`${card.color} p-6 text-white relative`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm opacity-80">{card.type}</p>
                      <h3 className="text-lg font-bold">{card.name}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => toggleBalanceVisibility(card.id)}
                      >
                        {showBalance[card.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => toggleCardStatus(card.id)}
                      >
                        {card.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-2xl font-mono tracking-wider">•••• •••• •••• {card.lastFour}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm opacity-80">Balance</p>
                        <p className="text-xl font-bold">{showBalance[card.id] ? formatINR(card.balance) : "••••••"}</p>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {card.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {card.limit && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Credit Utilization</span>
                          <span>{getUtilizationPercentage(card.balance, card.limit).toFixed(1)}%</span>
                        </div>
                        <Progress value={getUtilizationPercentage(card.balance, card.limit)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{formatINR(card.limit - card.balance)}</p>
                      </div>
                    )}

                    {card.dueDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Payment Due</span>
                        <span className="font-medium">{new Date(card.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {card.rewards && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rewards</span>
                        <span className="font-medium text-green-600">{card.rewards}</span>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setIsEditCardOpen(card.id)
                          setEditValues({ balance: String(card.balance), limit: String(card.limit ?? "") })
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 bg-transparent"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="credit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards
              .filter((card) => card.type === "Credit Card")
              .map((card) => (
                <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`${card.color} p-6 text-white relative`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm opacity-80">{card.type}</p>
                        <h3 className="text-lg font-bold">{card.name}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => toggleBalanceVisibility(card.id)}
                        >
                          {showBalance[card.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-2xl font-mono tracking-wider">•••• •••• •••• {card.lastFour}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm opacity-80">Balance</p>
                          <p className="text-xl font-bold">
                            {showBalance[card.id] ? formatINR(card.balance) : "••••••"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {card.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {card.limit && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Credit Utilization</span>
                            <span>{getUtilizationPercentage(card.balance, card.limit).toFixed(1)}%</span>
                          </div>
                          <Progress value={getUtilizationPercentage(card.balance, card.limit)} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{formatINR(card.limit - card.balance)}</p>
                        </div>
                      )}

                      {card.dueDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Payment Due</span>
                          <span className="font-medium">{new Date(card.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {card.rewards && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Rewards</span>
                          <span className="font-medium text-green-600">{card.rewards}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="debit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards
              .filter((card) => card.type === "Debit Card")
              .map((card) => (
                <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`${card.color} p-6 text-white relative`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm opacity-80">{card.type}</p>
                        <h3 className="text-lg font-bold">{card.name}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => toggleBalanceVisibility(card.id)}
                        >
                          {showBalance[card.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-2xl font-mono tracking-wider">•••• •••• •••• {card.lastFour}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm opacity-80">Available Balance</p>
                          <p className="text-xl font-bold">
                            {showBalance[card.id] ? formatINR(card.balance) : "••••••"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {card.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Account Type</span>
                        <span className="font-medium">{card.name.includes("Checking") ? "Checking" : "Savings"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Card Dialog */}
      <Dialog open={!!isEditCardOpen} onOpenChange={(open) => !open && setIsEditCardOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>Update current balance and credit limit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Balance (INR)</Label>
              <Input
                value={editValues.balance ?? ""}
                onChange={(e) => setEditValues((v) => ({ ...v, balance: e.target.value }))}
              />
            </div>
            <div>
              <Label>Credit Limit (INR)</Label>
              <Input
                value={editValues.limit ?? ""}
                onChange={(e) => setEditValues((v) => ({ ...v, limit: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditCardOpen(null)}>
                Cancel
              </Button>
              <Button onClick={() => isEditCardOpen && handleEditSave(isEditCardOpen)}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
