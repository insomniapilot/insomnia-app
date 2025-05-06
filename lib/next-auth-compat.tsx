"use client"

import { useSession as useRealSession } from "@/components/session-provider"
import { useAuth } from "@/contexts/auth-context"

// Re-export useSession dari komponen kita
export const useSession = useRealSession

// Fungsi signOut yang menggunakan useAuth
export function signOut() {
  const { signOut: authSignOut } = useAuth()
  return authSignOut()
}

// Fungsi signIn yang menggunakan useAuth
export function signIn(provider: string, options?: any) {
  const { signIn: authSignIn } = useAuth()
  if (provider === "credentials" && options?.email && options?.password) {
    return authSignIn(options.email, options.password)
  }
  return Promise.reject(new Error("Provider not supported"))
}

// Re-export SessionProvider dari komponen kita
export { SessionProvider } from "@/components/session-provider"
