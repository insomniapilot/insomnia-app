"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session } from "next-auth"
import { useSession } from "next-auth/react"

interface AuthContextType {
  session: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
  isLoading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false)
    }
  }, [status])

  return <AuthContext.Provider value={{ session, status, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
