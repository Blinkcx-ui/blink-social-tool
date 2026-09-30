import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // This explicitly protects your app but leaves the API, login page, and static files completely open so the POST request doesn't get blocked
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|logo.png).*)"],
};