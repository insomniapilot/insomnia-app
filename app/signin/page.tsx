"use client"

import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for error in URL
    const errorMessage = searchParams.get("error")
    if (errorMessage) {
      switch (errorMessage) {
        case "OAuthCallback":
          setError("There was a problem with the Google sign-in. Please try again.")
          break
        case "OAuthSignin":
          setError("Could not initiate Google sign-in. Please try again.")
          break
        case "Configuration":
          setError("There is a server configuration issue. Please contact support.")
          break
        default:
          setError(`Authentication error: ${errorMessage}`)
      }
    }
  }, [searchParams])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn("google", { callbackUrl: "/home" })
    } catch (err) {
      console.error("Sign-in error:", err)
      setError("Failed to sign in. Please try again.")
      setIsLoading(false)
    }
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
        </div>
      </div>
    </div>
  )
}
