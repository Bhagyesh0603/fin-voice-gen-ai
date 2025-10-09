"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, Menu, Settings, User, LogOut, Mic, MicOff } from "lucide-react"
import { useEffect, useState } from "react"
import { getDisplayUser, type FinvoiceUser } from "@/lib/user"

interface HeaderProps {
  onMenuClick: () => void
  isListening?: boolean
  onVoiceToggle?: () => void
}

export function Header({ onMenuClick, isListening = false, onVoiceToggle }: HeaderProps) {
  const [user, setUser] = useState<FinvoiceUser>(() => getDisplayUser())
  useEffect(() => {
    setUser(getDisplayUser())
  }, [])

  const initials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "JD"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/50 backdrop-blur-sm px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions, goals..." className="pl-10 bg-background/50" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Voice Input Button */}
        {onVoiceToggle && (
          <Button
            variant={isListening ? "default" : "ghost"}
            size="sm"
            onClick={onVoiceToggle}
            className={`${isListening ? "" : ""} transition-all duration-300`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        )}
        {/* AI Status */}
        <Badge variant="secondary" className="hidden sm:flex">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          AI Active
        </Badge>
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
            <span className="text-xs text-accent-foreground font-bold">3</span>
          </div>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">{initials(user?.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "John Doe"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "john@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
