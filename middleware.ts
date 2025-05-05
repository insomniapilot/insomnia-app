import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Get the pathname from the URL
  const path = request.nextUrl.pathname

  // Redirect rules
  if (!isAuthenticated && path !== "/signin" && path !== "/api/auth/signin") {
    return NextResponse.redirect(new URL("/signin", request.url))
  }

  // Redirect authenticated users from signin page to home
  if (isAuthenticated && path === "/signin") {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Redirect root to home for authenticated users
  if (isAuthenticated && path === "/") {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
