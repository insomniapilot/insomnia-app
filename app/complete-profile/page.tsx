"use client"

import { useState, type FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function CompleteProfile() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, update } = useSession()

  useEffect(() => {
    // Redirect jika user sudah memiliki username yang valid
    if (session?.user?.username && !session.user.username.startsWith("user_")) {
      router.push("/home")
    }
  }, [session, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!username || !password) {
      setError("Username and password are required")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    // Validasi username (hanya huruf, angka, dan underscore)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClientSupabaseClient()

      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("username")
        .eq("username", username)
        .maybeSingle()

      if (existingUser) {
        setError("Username is already taken")
        setIsLoading(false)
        return
      }

      // Update user in Supabase Auth with email/password
      if (session?.user?.email) {
        // Cari user ID berdasarkan email
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", session.user.email)
          .single()

        if (userError || !userData) {
          throw new Error("User not found")
        }

        // Update password di Supabase Auth
        const { error: authError } = await supabase.auth.updateUser({
          password: password,
        })

        if (authError) {
          throw new Error(authError.message)
        }

        // Update username di tabel users
        const { error: updateError } = await supabase
          .from("users")
          .update({
            username: username,
          })
          .eq("id", userData.id)

        if (updateError) {
          throw new Error(updateError.message)
        }

        // Update session dengan username baru
        await update({
          ...session,
          user: {
            ...session.user,
            username,
          },
        })

        // Redirect to home page
        router.push("/home")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">Complete Your Profile</h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please set up your username and password to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? "Processing..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
