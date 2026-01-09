// src/lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

// Roles must match schema.prisma
export type Role = "OWNER" | "MANAGER" | "CHECKIN_STAFF" | "STAFF"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        console.log("Authenticated user:", user.email, "with role:", user.role)

        return {
          id: user.id,
          name: user.name,
          role: user.role as Role,
          email: user.email,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.role = user.role as Role
      }
      return token
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        role: token.role as Role, // strictly typed
        email: session.user?.email ?? "",
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
}

export default NextAuth(authOptions)
