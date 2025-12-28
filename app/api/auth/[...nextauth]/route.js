import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { username, password } = credentials;

          // Check if it's admin login (phone number)
          if (
            username === process.env.ADMIN_PHONE &&
            password === process.env.ADMIN_PASSWORD
          ) {
            return {
              id: "admin",
              name: "Admin",
              role: "admin",
              isAdmin: true,
            };
          }

          // Otherwise, check staff database
          await dbConnect();
          const user = await User.findOne({ username });

          if (!user) {
            return null;
          }

          if (!user.isActive) {
            throw new Error("Account is deactivated");
          }

          const isValid = await user.comparePassword(password);

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.username,
            role: user.role,
            isAdmin: false,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
