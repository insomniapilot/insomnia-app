import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function middleware(request: NextRequest) {
  // Untuk debugging
  console.log("Middleware running on path:", request.nextUrl.pathname)

  // Get the pathname from the URL
  const path = request.nextUrl.pathname

  // Skip middleware for not-found, error pages, API routes, register page, and static files
  if (
    path.startsWith("/_next") ||
    path === "/404" ||
    path === "/500" ||
    path === "/register" ||
    path === "/signin" ||
    path.includes(".") ||
    path.startsWith("/api")
  ) {
    return NextResponse.next()
  }

  try {
    // Check if user is authenticated
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const isAuthenticated = !!session
    console.log("Authentication status:", isAuthenticated ? "Authenticated" : "Not authenticated")

    // Redirect rules
    if (!isAuthenticated && path !== "/signin" && path !== "/register") {
      console.log("Redirecting unauthenticated user to signin")
      return NextResponse.redirect(new URL("/signin", request.url))
    }

    // Redirect root to home for authenticated users
    if (isAuthenticated && path === "/") {
      console.log("Redirecting root to home")
      return NextResponse.redirect(new URL("/home", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of error, redirect to signin
    return NextResponse.redirect(new URL("/signin", request.url))
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
