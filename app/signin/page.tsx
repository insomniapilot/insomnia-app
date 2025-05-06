"use client"

import type React from "react"

import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Check for error in URL
    const errorMessage = searchParams.get("error")
    if (errorMessage) {
      console.log("Auth error:", errorMessage)
      switch (errorMessage) {
        case "OAuthCallback":
          setError("Ada masalah dengan Google sign-in. Silakan coba lagi.")
          break
        case "OAuthSignin":
          setError("Tidak dapat memulai Google sign-in. Silakan coba lagi.")
          break
        case "Configuration":
          setError(
            "Ada masalah konfigurasi server. Pastikan NEXTAUTH_URL dan NEXTAUTH_SECRET sudah diatur dengan benar.",
          )
          break
        case "AccessDenied":
          setError(
            "Akses ditolak. Pastikan Anda mengizinkan aplikasi untuk mengakses data Google Anda atau coba dengan akun Google lain.",
          )
          break
        default:
          setError(`Error autentikasi: ${errorMessage}`)
      }
    }
  }, [searchParams])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Starting Google sign-in...")

      await signIn("google", {
        callbackUrl: "/home",
        redirect: true,
      })
    } catch (err) {
      console.error("Sign-in error:", err)
      setError("Gagal sign in. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Email dan password diperlukan")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/home",
        redirect: false,
      })

      if (result?.error) {
        setError("Email atau password salah")
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (err) {
      console.error("Sign-in error:", err)
      setError("Gagal sign in. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = () => {
    router.push("/register")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">SocialApp</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Connect with friends and the world around you</p>
        </div>

        {error && (
          <div
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {showEmailLogin ? (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isLoading ? "Loading..." : "Sign in"}
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowEmailLogin(false)}
                  className="text-sm text-primary hover:text-primary/90"
                >
                  Kembali ke opsi login
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="rounded-md shadow-sm">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary border-gray-300"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-500 group-hover:text-gray-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                  </span>
                  {isLoading ? "Loading..." : "Sign in with Google"}
                </button>
              </div>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowEmailLogin(true)}
                  className="text-sm text-primary hover:text-primary/90"
                >
                  Sign in with email and password
                </button>
              </div>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleRegister}
                  className="inline-block px-4 py-2 bg-white dark:bg-gray-800 text-primary rounded-md shadow hover:shadow-md transition-all"
                >
                  Belum punya akun? Register di sini
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
