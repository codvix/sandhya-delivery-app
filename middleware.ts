import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session_token")?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin")

  // Decode and validate cookie (Edge-safe: use atob)
  let isValidSession = false
  let isExpired = false
  if (sessionCookie) {
    try {
      const json = typeof atob === "function" ? atob(sessionCookie) : Buffer.from(sessionCookie, "base64").toString("utf8")
      const parsed = JSON.parse(json) as { userId?: string; exp?: number }
      if (parsed && typeof parsed.userId === "string" && typeof parsed.exp === "number") {
        isExpired = parsed.exp <= Date.now()
        isValidSession = !isExpired
      }
    } catch {
      isValidSession = false
    }
  }

  // If session is present but invalid/expired, clear it and treat as unauthenticated
  if (sessionCookie && (!isValidSession || isExpired)) {
    const res = NextResponse.redirect(new URL("/login", request.url))
    res.cookies.set("session_token", "", { path: "/", expires: new Date(0) })
    return res
  }

  // If user is not authenticated and trying to access protected route
  if (!isValidSession && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If user is authenticated and trying to access auth pages
  // Redirect to home page - the auth context will handle admin redirection
  if (isValidSession && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // For admin routes, we'll check role in the page component
  // since we can't easily decode the session here

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)"],
}
