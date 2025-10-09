export type FinvoiceUser = {
  id: string
  name: string
  email: string
  image?: string
}

const LS_USER_KEY = "finvoice_user"

export function getUser(): FinvoiceUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LS_USER_KEY)
    return raw ? (JSON.parse(raw) as FinvoiceUser) : null
  } catch {
    return null
  }
}

export function setUser(u: FinvoiceUser) {
  if (typeof window === "undefined") return
  localStorage.setItem(LS_USER_KEY, JSON.stringify(u))
}

export function clearUser() {
  if (typeof window === "undefined") return
  localStorage.removeItem(LS_USER_KEY)
}

export function getDisplayUser(): FinvoiceUser {
  // Fallback to John Doe ONLY if no user exists (e.g., manual URL access without auth)
  return (
    getUser() || {
      id: "guest",
      name: "John Doe",
      email: "john.doe@example.com",
    }
  )
}
