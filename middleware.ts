import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Untuk debugging
  console.log("Middleware running on path:", request.nextUrl.pathname)

  // Coba dapatkan token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token
  console.log("Authentication status:", isAuthenticated ? "Authenticated" : "Not authenticated")

  // Get the pathname from the URL
  const path = request.nextUrl.pathname

  // Skip middleware for not-found, error pages, and API routes (except auth)
  if (
    path.startsWith("/_next") ||
    path === "/404" ||
    path === "/500" ||
    (path.startsWith("/api") && !path.startsWith("/api/auth"))
  ) {
    return NextResponse.next()
  }

  // Redirect rules
  if (!isAuthenticated && path !== "/signin" && !path.startsWith("/api/auth")) {
    console.log("Redirecting unauthenticated user to signin")
    return NextResponse.redirect(new URL("/signin", request.url))
  }

  // Redirect authenticated users from signin page to home
  if (isAuthenticated && path === "/signin") {
    console.log("Redirecting authenticated user to home")
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Redirect root to home for authenticated users
  if (isAuthenticated && path === "/") {
    console.log("Redirecting root to home")
    return NextResponse.redirect(new URL("/home", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
