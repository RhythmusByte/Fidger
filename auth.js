import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDb } from "./lib/mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = await getDb();
        const user = await db.collection("users").findOne({
          email: String(credentials.email).toLowerCase().trim(),
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
      }
      return session;
    },
    // Runs in the proxy layer to decide whether a request is allowed through.
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPath =
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register-a7x9") ||
        request.nextUrl.pathname.startsWith("/api/auth") ||
        request.nextUrl.pathname.startsWith("/api/register");

      if (isPublicPath) return true;
      return isLoggedIn;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
