import { withAuth } from "next-auth/middleware"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // Add any custom middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If accessing dashboard routes, require authentication
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }
        
        // For other routes, allow access
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/expenses/:path*", 
    "/api/budgets/:path*",
    "/api/goals/:path*",
    "/api/user/:path*"
  ]
}