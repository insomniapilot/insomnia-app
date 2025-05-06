"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"

// Tipe untuk session
interface Session {
  user: {
    id: string
    name?: string
    email?: string
    image?: string
    username?: string
  } | null
}

// Tipe untuk context
interface SessionContextType {
  data: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
  update: (data: any) => Promise<void>
}

// Buat context dengan nilai default yang valid
const SessionContext = createContext<SessionContextType>({
  data: null,
  status: "unauthenticated",
  update: async () => {},
})

// Hook untuk menggunakan session
export function useSession() {
  return useContext(SessionContext)
}

// Provider component
export function SessionProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  // Buat session data dari user
  const session: Session | null = user
    ? {
        user: {
          id: user.id,
          name: user.full_name || user.username,
          email: user.email,
          image: user.avatar_url,
          username: user.username,
        },
      }
    : null

  // Status session
  const status = isLoading ? "loading" : user ? "authenticated" : "unauthenticated"

  // Dummy update function
  const update = async (data: any) => {
    console.log("Session update called with:", data)
  }

  return <SessionContext.Provider value={{ data: session, status, update }}>{children}</SessionContext.Provider>
}
