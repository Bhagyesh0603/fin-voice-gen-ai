"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  Target,
  MessageCircle,
  TrendingUp,
  Settings,
  LogOut,
  X,
  PieChart,
  CreditCard,
  Calculator,
  FileText,
  Brain,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useFinVoiceData } from "@/hooks/useAuthFinVoiceData"

const navigationItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Dashboard overview",
  },
  {
    title: "Expenses",
    href: "/dashboard/expenses",
    icon: Receipt,
    description: "Track your spending",
  },
  {
    title: "AI Insights",
    href: "/dashboard/insights",
    icon: Brain,
    description: "Financial coaching insights",
    badge: "Smart",
  },
  {
    title: "Goals",
    href: "/dashboard/goals",
    icon: Target,
    description: "Savings & financial goals",
  },
  {
    title: "AI Advisor",
    href: "/dashboard/advisor",
    icon: MessageCircle,
    description: "Chat with AI assistant",
    badge: "AI",
  },
  {
    title: "Investments",
    href: "/dashboard/investments",
    icon: TrendingUp,
    description: "Investment portfolio",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: PieChart,
    description: "Detailed reports",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
    description: "Generate PDF reports",
    badge: "New",
  },
  {
    title: "Cards",
    href: "/dashboard/cards",
    icon: CreditCard,
    description: "Manage payment cards",
  },
  {
    title: "Budget",
    href: "/dashboard/budget",
    icon: Calculator,
    description: "Budget planning",
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { totalBalance } = useFinVoiceData()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-serif text-foreground">FinVoice</h1>
                <p className="text-xs text-muted-foreground">AI Financial Assistant</p>
              </div>
            </Link>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                {session?.user?.image && (
                  <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getUserInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {session?.user?.name || "FinVoice User"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {session?.user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Balance</span>
                <Badge variant="secondary" className="animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Live
                </Badge>
              </div>
              <p className="text-2xl font-bold text-primary mt-1">
                ₹{totalBalance.balance.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <div
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group hover:bg-primary/10 ${
                      isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground"
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 transition-colors ${
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t space-y-2">
            <Link href="/dashboard/settings">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
