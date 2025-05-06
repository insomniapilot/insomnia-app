"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"

// Dummy useSession untuk mengatasi error
export function useSession() {
  const { user, isLoading, signIn: authSignIn, signOut: authSignOut } = useAuth()
  const [session, setSession] = useState({
    data: user
      ? {
          user: {
            id: user.id,
            name: user.full_name || user.username,
            email: user.email,
            image: user.avatar_url,
            username: user.username,
          },
        }
      : null,
    status: isLoading ? "loading" : user ? "authenticated" : "unauthenticated",
  })

  useEffect(() => {
    setSession({
      data: user
        ? {
            user: {
              id: user.id,
              name: user.full_name || user.username,
              email: user.email,
              image: user.avatar_url,
              username: user.username,
            },
          }
        : null,
      status: isLoading ? "loading" : user ? "authenticated" : "unauthenticated",
    })
  }, [user, isLoading])

  return session
}

// Dummy signOut untuk mengatasi error
export function signOut() {
  const { signOut: authSignOut } = useAuth()
  return authSignOut()
}

// Dummy signIn untuk mengatasi error
export function signIn(provider: string, options?: any) {
  const { signIn: authSignIn } = useAuth()
  if (provider === "credentials" && options?.email && options?.password) {
    return authSignIn(options.email, options.password)
  }
  return Promise.reject(new Error("Provider not supported"))
}
