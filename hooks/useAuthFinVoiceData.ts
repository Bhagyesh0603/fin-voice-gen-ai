"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useSession } from "next-auth/react"

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  voiceNote?: string
  receiptImage?: string
  createdAt: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  period: "monthly" | "weekly" | "yearly"
  createdAt: string
}

export interface Goal {
  id: string
  title: string
  name?: string // Optional, defaults to title
  description?: string
  targetAmount: number
  currentAmount: number
  monthlyContribution?: number
  deadline: string
  category: string
  createdAt: string
}

export interface Investment {
  id: string
  name: string
  type: string
  amount: number
  currentValue: number
  returns: number
  createdAt: string
}

export interface Card {
  id: string
  name: string
  last4: string
  lastFour?: string // For backward compatibility
  type: "credit" | "debit"
  bank: string
  limit?: number
  balance?: number
  status?: "active" | "locked"
  color?: string
  dueDate?: string
  rewards?: string
  createdAt: string
}

export function useFinVoiceData() {
  const { data: session, status } = useSession()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isFetchingRef = useRef(false)
  const mountedRef = useRef(true)

  const fetchData = async () => {
    // Only fetch when authenticated
    if (status !== "authenticated") return

    // Avoid concurrent fetches
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    if (mountedRef.current) {
      setIsLoading(true)
      setError(null)
    }

    try {
      const [expensesRes, budgetsRes, goalsRes, investmentsRes, cardsRes] = await Promise.all([
        fetch("/api/expenses"),
        fetch("/api/budgets"),
        fetch("/api/goals"),
        fetch("/api/investments"),
        fetch("/api/cards")
      ])

      if (mountedRef.current) {
        if (expensesRes.ok) {
          const expensesData = await expensesRes.json()
          setExpenses(expensesData)
        }

        if (budgetsRes.ok) {
          const budgetsData = await budgetsRes.json()
          setBudgets(budgetsData)
        }

        if (goalsRes.ok) {
          const goalsData = await goalsRes.json()
          setGoals(goalsData)
        }

        if (investmentsRes.ok) {
          const investmentsData = await investmentsRes.json()
          setInvestments(investmentsData)
        }

        if (cardsRes.ok) {
          const cardsData = await cardsRes.json()
          setCards(cardsData)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      if (mountedRef.current) setError("Failed to load data")
    } finally {
      isFetchingRef.current = false
      if (mountedRef.current) setIsLoading(false)
    }
  }

  useEffect(() => {
    // Keep mounted ref accurate
    mountedRef.current = true

    // Only trigger when we are authenticated. Use session user email so changes to the same session
    // object don't repeatedly refire fetches.
    if (status === "authenticated") {
      fetchData()
    }

    return () => {
      mountedRef.current = false
    }
    // Only watch for authentication status and the user's stable identifier
  }, [status, session?.user?.email])

  // Memoize computed totals to avoid creating a new object every render which can cause
  // downstream re-renders in consumers.
  const totalBalance = useMemo(() => {
    const income = expenses.filter(e => e.category === "income").reduce((sum, e) => sum + e.amount, 0)
    const expenseSum = expenses.filter(e => e.category !== "income").reduce((sum, e) => sum + e.amount, 0)
    return {
      income,
      expenses: expenseSum,
      balance: income - expenseSum,
    }
  }, [expenses])

  const addExpense = async (expenseData: Omit<Expense, "id" | "createdAt">) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      })

      if (response.ok) {
        const newExpense = await response.json()
        setExpenses(prev => [newExpense, ...prev])
        return newExpense
      } else {
        throw new Error("Failed to add expense")
      }
    } catch (error) {
      console.error("Error adding expense:", error)
      throw error
    }
  }

  const addBudget = async (budgetData: Omit<Budget, "id" | "createdAt" | "spent">) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budgetData),
      })

      if (response.ok) {
        const newBudget = await response.json()
        setBudgets(prev => [newBudget, ...prev])
        return newBudget
      } else {
        throw new Error("Failed to add budget")
      }
    } catch (error) {
      console.error("Error adding budget:", error)
      throw error
    }
  }

  const addGoal = async (goalData: Omit<Goal, "id" | "createdAt">) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      })

      if (response.ok) {
        const newGoal = await response.json()
        setGoals(prev => [newGoal, ...prev])
        return newGoal
      } else {
        throw new Error("Failed to add goal")
      }
    } catch (error) {
      console.error("Error adding goal:", error)
      throw error
    }
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })

      if (response.ok) {
        const updatedGoal = await response.json()
        setGoals(prev => prev.map(goal => goal.id === id ? updatedGoal : goal))
        return updatedGoal
      } else {
        throw new Error("Failed to update goal")
      }
    } catch (error) {
      console.error("Error updating goal:", error)
      throw error
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal.id !== id))
      } else {
        throw new Error("Failed to delete goal")
      }
    } catch (error) {
      console.error("Error deleting goal:", error)
      throw error
    }
  }

  const contributeToGoal = async (goalId: string, amount: number, note?: string, date?: string) => {
    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) throw new Error("Goal not found")

      const updatedGoal = {
        ...goal,
        currentAmount: goal.currentAmount + amount
      }

      return await updateGoal(goalId, updatedGoal)
    } catch (error) {
      console.error("Error contributing to goal:", error)
      throw error
    }
  }

  const addInvestment = async (investmentData: Omit<Investment, "id" | "createdAt">) => {
    try {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(investmentData),
      })

      if (response.ok) {
        const newInvestment = await response.json()
        setInvestments(prev => [newInvestment, ...prev])
        return newInvestment
      } else {
        throw new Error("Failed to add investment")
      }
    } catch (error) {
      console.error("Error adding investment:", error)
      throw error
    }
  }

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    try {
      const response = await fetch("/api/investments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })

      if (response.ok) {
        const updatedInvestment = await response.json()
        setInvestments(prev => prev.map(inv => inv.id === id ? updatedInvestment : inv))
        return updatedInvestment
      } else {
        throw new Error("Failed to update investment")
      }
    } catch (error) {
      console.error("Error updating investment:", error)
      throw error
    }
  }

  const deleteInvestment = async (id: string) => {
    try {
      const response = await fetch(`/api/investments?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setInvestments(prev => prev.filter(inv => inv.id !== id))
      } else {
        throw new Error("Failed to delete investment")
      }
    } catch (error) {
      console.error("Error deleting investment:", error)
      throw error
    }
  }

  const addCard = async (cardData: Omit<Card, "id" | "createdAt">) => {
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      })

      if (response.ok) {
        const newCard = await response.json()
        setCards(prev => [newCard, ...prev])
        return newCard
      } else {
        throw new Error("Failed to add card")
      }
    } catch (error) {
      console.error("Error adding card:", error)
      throw error
    }
  }

  const updateCard = async (id: string, updates: Partial<Card>) => {
    try {
      const response = await fetch("/api/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })

      if (response.ok) {
        const updatedCard = await response.json()
        setCards(prev => prev.map(card => card.id === id ? updatedCard : card))
        return updatedCard
      } else {
        throw new Error("Failed to update card")
      }
    } catch (error) {
      console.error("Error updating card:", error)
      throw error
    }
  }

  const deleteCard = async (id: string) => {
    try {
      const response = await fetch(`/api/cards?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCards(prev => prev.filter(card => card.id !== id))
      } else {
        throw new Error("Failed to delete card")
      }
    } catch (error) {
      console.error("Error deleting card:", error)
      throw error
    }
  }


  return {
    // Data
    expenses,
    budgets,
    goals,
    investments,
    cards,
    totalBalance,
    
    // State
    isLoading,
    error,
    
    // Actions
    addExpense,
    updateExpense: async (id: string, updates: Partial<Expense>) => {
      try {
        const response = await fetch("/api/expenses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        })

        if (response.ok) {
          const updatedExpense = await response.json()
          setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp))
          return updatedExpense
        } else {
          throw new Error("Failed to update expense")
        }
      } catch (error) {
        console.error("Error updating expense:", error)
        throw error
      }
    },
    deleteExpense: async (id: string) => {
      try {
        const response = await fetch(`/api/expenses?id=${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setExpenses(prev => prev.filter(exp => exp.id !== id))
        } else {
          throw new Error("Failed to delete expense")
        }
      } catch (error) {
        console.error("Error deleting expense:", error)
        throw error
      }
    },
    addBudget,
    updateBudget: async (id: string, updates: Partial<Budget>) => {
      try {
        const response = await fetch("/api/budgets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        })

        if (response.ok) {
          const updatedBudget = await response.json()
          setBudgets(prev => prev.map(budget => budget.id === id ? updatedBudget : budget))
          return updatedBudget
        } else {
          throw new Error("Failed to update budget")
        }
      } catch (error) {
        console.error("Error updating budget:", error)
        throw error
      }
    },
    deleteBudget: async (id: string) => {
      try {
        const response = await fetch(`/api/budgets?id=${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setBudgets(prev => prev.filter(budget => budget.id !== id))
        } else {
          throw new Error("Failed to delete budget")
        }
      } catch (error) {
        console.error("Error deleting budget:", error)
        throw error
      }
    },
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addCard,
    updateCard,
    deleteCard,
    refreshData: fetchData,
    
    // Auth
    session,
    isAuthenticated: status === "authenticated"
  }
}