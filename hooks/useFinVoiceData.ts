"use client"

import { useState, useEffect } from "react"
import { dataManager, type Expense, type Budget, type Goal, type Investment, type Card } from "@/lib/localStorage"

export function useFinVoiceData() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [totalBalance, setTotalBalance] = useState({ income: 0, expenses: 0, balance: 0 })

  const refreshData = () => {
    setExpenses(dataManager.getExpenses())
    setBudgets(dataManager.getBudgets())
    setGoals(dataManager.getGoals())
    setInvestments(dataManager.getInvestments())
    setCards(dataManager.getCards())
    setTotalBalance(dataManager.getTotalBalance())
  }

  useEffect(() => {
    refreshData()

    // Subscribe to all data changes for real-time updates
    dataManager.subscribe("data_changed", refreshData)
    dataManager.subscribe("finvoice_expenses_updated", refreshData)
    dataManager.subscribe("finvoice_budgets_updated", refreshData)
    dataManager.subscribe("finvoice_goals_updated", refreshData)
    dataManager.subscribe("finvoice_investments_updated", refreshData)
    dataManager.subscribe("finvoice_cards_updated", refreshData)

    return () => {
      dataManager.unsubscribe("data_changed", refreshData)
      dataManager.unsubscribe("finvoice_expenses_updated", refreshData)
      dataManager.unsubscribe("finvoice_budgets_updated", refreshData)
      dataManager.unsubscribe("finvoice_goals_updated", refreshData)
      dataManager.unsubscribe("finvoice_investments_updated", refreshData)
      dataManager.unsubscribe("finvoice_cards_updated", refreshData)
    }
  }, [])

  return {
    expenses,
    budgets,
    goals,
    investments,
    cards,
    totalBalance,
    refreshData,
    // Helper methods
    addExpense: (expense: Omit<Expense, "id" | "createdAt">) => dataManager.addExpense(expense),
    updateExpense: (id: string, updates: Partial<Expense>) => dataManager.updateExpense(id, updates),
    deleteExpense: (id: string) => dataManager.deleteExpense(id),
    addBudget: (budget: Omit<Budget, "id" | "createdAt" | "spent">) => dataManager.addBudget(budget),
    addGoal: (goal: Omit<Goal, "id" | "createdAt">) => dataManager.addGoal(goal),
    updateGoal: (id: string, updates: Partial<Goal>) => dataManager.updateGoal(id, updates),
    deleteGoal: (id: string) => dataManager.deleteGoal(id),
    contributeToGoal: (goalId: string, amount: number, note?: string, date?: string) =>
      dataManager.contributeToGoal(goalId, amount, note, date),
    addInvestment: (investment: Omit<Investment, "id" | "createdAt">) => dataManager.addInvestment(investment),
    addCard: (card: Omit<Card, "id" | "createdAt">) => dataManager.addCard(card),
    updateCard: (id: string, updates: Partial<Card>) => dataManager.updateCard(id, updates),
    deleteCard: (id: string) => dataManager.deleteCard(id),
  }
}
