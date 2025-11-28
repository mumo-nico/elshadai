import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login-landlord",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
