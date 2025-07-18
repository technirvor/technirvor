import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Redirect non-admin users from /admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
      return NextResponse.redirect(new URL("/auth/error?error=AccessDenied", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access to /admin routes only if token exists (logged in)
        // Specific role check is done in the middleware function above
        return !!token
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
  },
)

export const config = {
  matcher: ["/admin/:path*", "/profile", "/my-orders"], // Protect admin routes and user-specific pages
}
