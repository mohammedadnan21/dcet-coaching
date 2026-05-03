import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/teacher") && token?.role !== "TEACHER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/student") && !["STUDENT", "ADMIN"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/teacher") ||
          pathname.startsWith("/student")
        ) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
